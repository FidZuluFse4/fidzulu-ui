import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { AddressService } from './address/address.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';
import { Team } from '../models/team.model';

// Mock AddressService
class MockAddressService {
  private selected$ = new BehaviorSubject<any>({
    id: '1',
    location: 'India',
    full_addr: 'Mock',
    isDefault: true,
  });
  getSelectedAddress() {
    return this.selected$.asObservable();
  }
  emit(loc: string) {
    this.selected$.next({
      id: '1',
      location: loc,
      full_addr: 'Mock',
      isDefault: true,
    });
  }
}

describe('ProductService (Full Coverage)', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  let address: MockAddressService;

  const backendProducts = [
    {
      id: 'p1',
      p_type: 'Bike',
      p_price: 120,
      p_img_url: ['img1.jpg', 'extra.jpg'],
      attribute: { Color: 'Red', Size: 'M' },
      p_quantity: 5,
      p_sub_type: 'BrandA',
      p_name: 'Road Bike',
    },
    {
      p_id: 'p2',
      p_type: 'Bike',
      p_price: 80,
      p_img_url: ['img2.jpg'],
      attribute: { Color: 'Blue', Size: 'S' },
      p_quantity: 3,
      p_subtype: 'BrandB',
      p_name: 'City Bike',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AddressService, useClass: MockAddressService }],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
    address = TestBed.inject(AddressService) as any;
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushInitial(payload: any = backendProducts, category = 'Bike') {
    service.setActiveCategory(category);
    service.getAllProducts().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/bikes/IN'));
    req.flush(payload);
  }

  it('should normalize products with fallbacks', async () => {
    flushInitial();
    const products = await firstValueFrom(service.getAllProducts());
    expect(products[0].p_id).toBe('p1'); // id -> p_id
    expect(products[0].p_img_url).toBe('img1.jpg'); // first image only
    expect(products[0].p_subtype).toBe('BrandA'); // fallback subtype
  });

  it('should return empty when backend returns unexpected shape', async () => {
    flushInitial({ wrong: 'data' });
    const products = await firstValueFrom(service.getAllProducts());
    expect(products.length).toBe(0);
  });

  it('getProductById should return a product if found', async () => {
    flushInitial();
    const prod = await firstValueFrom(service.getProductById('p1'));
    expect(prod.p_name).toBe('Road Bike');
  });

  it('getProductById should throw if not found', async () => {
    flushInitial();
    let error: any;
    try {
      await firstValueFrom(service.getProductById('missing'));
    } catch (e) {
      error = e;
    }
    expect(error).toBeTruthy();
  });

  it('mapLocationToCode should handle different inputs', () => {
    expect((service as any).mapLocationToCode('India')).toBe('IN');
    expect((service as any).mapLocationToCode('Ireland')).toBe('IR');
    expect((service as any).mapLocationToCode('USA')).toBe('US-NC');
    expect((service as any).mapLocationToCode('Unknown')).toBe('US-NC');
    expect((service as any).mapLocationToCode()).toBe('US-NC');
  });

  it('setActiveCategory should not emit when falsy', () => {
    service.setActiveCategory('');
    expect(service.getActiveCategory()).toBe('Bike'); // unchanged default
  });

  it('getTeamsForCategory should return teams on success', async () => {
    const obs = service.getTeamsForCategory('Bike').subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/bikes/team'));
    const mockTeams: Team[] = [{ id: 't1', name: 'Team1' } as any];
    req.flush(mockTeams);
    obs.unsubscribe();
  });

  it('getTeamsForCategory should handle error gracefully', async () => {
    const promise = firstValueFrom(service.getTeamsForCategory('Bike'));
    const req = httpMock.expectOne((r) => r.url.includes('/bikes/team'));
    req.flush('error', { status: 500, statusText: 'Server Error' });
    const result = await promise;
    expect(result).toEqual([]);
  });

  it('should apply pagination, search and filters', async () => {
    flushInitial();
    const page = await firstValueFrom(
      service.getPaginatedAndFilteredProducts(
        'Bike',
        0,
        10,
        { price: 100, Brand___SEP___BrandB: true },
        'city'
      )
    );
    expect(page.products.length).toBe(1);
    expect(page.products[0].p_id).toBe('p2');
  });

  it('getFiltersForCategory should return attributes and price range', async () => {
    flushInitial();
    const filters = await firstValueFrom(service.getFiltersForCategory('Bike'));
    expect(filters.minPrice).toBe(80);
    expect(filters.maxPrice).toBe(120);
    expect(filters.attributes.get('Brand')?.size).toBeGreaterThan(0);
  });

  it('getFiltersForCategory should handle no products', async () => {
    flushInitial([]);
    const filters = await firstValueFrom(service.getFiltersForCategory('Bike'));
    expect(filters.minPrice).toBe(0);
    expect(filters.maxPrice).toBe(1000);
  });

  it('should refetch when address changes', async () => {
    flushInitial();
    address.emit('USA');
    const req2 = httpMock.expectOne((r) => r.url.includes('/bikes/US-NC'));
    req2.flush(backendProducts.slice(0, 1));
    const products = await firstValueFrom(service.getAllProducts());
    expect(products.length).toBe(1);
  });

  it('should handle HTTP error when fetching products', async () => {
    service.getAllProducts().subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/bikes/IN'));
    req.flush('error', { status: 500, statusText: 'Server Error' });
    const products = await firstValueFrom(service.getAllProducts());
    expect(products).toEqual([]);
  });

  it('extractArrayPayload should handle various shapes', () => {
    const fn = (service as any).extractArrayPayload.bind(service);
    expect(fn([1, 2])).toEqual([1, 2]);
    expect(fn({ products: [1] })).toEqual([1]);
    expect(fn({ data: [2] })).toEqual([2]);
    expect(fn({ items: [3] })).toEqual([3]);
    expect(fn({ something: [4] })).toEqual([4]);
    expect(fn({})).toEqual([]);
  });

  it('normalizeProducts should handle missing subtype', () => {
    const fn = (service as any).normalizeProducts.bind(service);
    const res = fn([{ p_id: 'x', p_type: 'Bike', p_price: '50' }]);
    expect(res[0].p_subtype).toBeUndefined();
    expect(res[0].p_price).toBe(50);
  });

  it('normalizeProducts should handle empty input', () => {
    const fn = (service as any).normalizeProducts.bind(service);
    expect(fn([])).toEqual([]);
  });
});
