import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ProductService, PagedProducts } from './product.service';
import { AddressService } from './address/address.service';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';

// Simple mock address service to emit selected address
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

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  let address: MockAddressService;

  // Utility to build backend payload variations
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
    {
      p_id: 'p3',
      p_type: 'Bike',
      p_price: 200,
      p_img_url: 'single.jpg',
      attribute: { Color: 'Red', Size: 'L' },
      p_quantity: 10,
      p_subtype: 'BrandB',
      p_name: 'Mountain Bike',
    },
    {
      p_id: 'p4',
      p_type: 'Books',
      p_price: 30,
      p_img_url: 'book.jpg',
      attribute: { Language: 'English' },
      p_quantity: 15,
      p_subtype: 'Fiction',
      p_name: 'Novel',
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

  function flushInitial(
    category: string = 'Bike',
    payload: any = backendProducts
  ) {
    // Ensure active category is set (default is Bike)
    service.setActiveCategory(category);
    // Trigger subscription
    service.getAllProducts().subscribe();
    // Expect request based on category and India => IN code
    const req = httpMock.expectOne(
      (r) => r.url.includes('/bikes/IN') || r.url.includes('/books/IN')
    );
    req.flush(payload);
  }

  it('should normalize products (single image, id mapping, subtype fallback)', async () => {
    flushInitial();
    const products = await firstValueFrom(service.getAllProducts());
    expect(products.length).toBe(4);
    const p1 = products.find((p) => p.p_id === 'p1')!;
    expect(p1.p_img_url).toBe('img1.jpg'); // only first
    expect(p1.p_subtype).toBe('BrandA'); // from p_sub_type fallback
  });

  it('should filter by category (Bike)', async () => {
    flushInitial();
    const page = await firstValueFrom(
      service.getPaginatedAndFilteredProducts('Bike', 0, 10, {}, null)
    );
    expect(page.totalCount).toBe(3); // only bike products
    expect(page.products.every((p) => p.p_type === 'Bike')).toBeTrue();
  });

  it('should apply search term filtering (name + desc + subtype)', async () => {
    flushInitial();
    const page = await firstValueFrom(
      service.getPaginatedAndFilteredProducts('Bike', 0, 10, {}, 'mountain')
    );
    expect(page.totalCount).toBe(1);
    expect(page.products[0].p_id).toBe('p3');
  });

  it('should apply price upper-bound filter', async () => {
    flushInitial();
    const page = await firstValueFrom(
      service.getPaginatedAndFilteredProducts(
        'Bike',
        0,
        10,
        { price: 100 },
        null
      )
    );
    // p1=120 filtered out, p2=80 ok, p3=200 filtered out
    expect(page.totalCount).toBe(1);
    expect(page.products[0].p_id).toBe('p2');
  });

  it('should apply attribute filters including Brand subtype', async () => {
    flushInitial();
    const filters = {
      // emulate sidebar control naming Brand___SEP___BrandB
      Brand___SEP___BrandB: true,
      Color___SEP___Red: true,
    };
    const page = await firstValueFrom(
      service.getPaginatedAndFilteredProducts('Bike', 0, 10, filters, null)
    );
    // Expect products that are brandB and Color Red -> only p3
    expect(page.totalCount).toBe(1);
    expect(page.products[0].p_id).toBe('p3');
  });

  it('should paginate properly', async () => {
    flushInitial();
    const page1 = await firstValueFrom(
      service.getPaginatedAndFilteredProducts('Bike', 0, 2, {}, null)
    );
    const page2 = await firstValueFrom(
      service.getPaginatedAndFilteredProducts('Bike', 1, 2, {}, null)
    );
    expect(page1.products.length).toBe(2);
    // second page should have remaining 1
    expect(page2.products.length).toBe(1);
    expect(page1.totalCount).toBe(3);
    expect(page2.totalCount).toBe(3);
  });

  it('should compute filters for a category', async () => {
    flushInitial();
    const filters$ = service.getFiltersForCategory('Bike');
    const result = await firstValueFrom(filters$);
    // Expect Brand set contains BrandA and BrandB
    const brandSet = result.attributes.get('Brand');
    expect(brandSet).toBeTruthy();
    expect(brandSet?.has('BrandA')).toBeTrue();
    expect(brandSet?.has('BrandB')).toBeTrue();
    expect(result.minPrice).toBe(80);
    expect(result.maxPrice).toBe(200);
  });

  it('should refetch when address changes (different code) and not crash', async () => {
    flushInitial();
    // Emit new address (USA)
    address.emit('USA');
    // Expect another request now for bikes/US-NC
    const req2 = httpMock.expectOne((r) => r.url.includes('/bikes/US-NC'));
    req2.flush(backendProducts.slice(0, 2));
    const products = await firstValueFrom(service.getAllProducts());
    expect(products.length).toBe(2);
  });
});
