import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsPageComponent } from './product-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { SearchService } from '../../services/search.service';
import { AddressService } from '../../services/address/address.service';
import { UserService } from '../../services/user.service';

class MockSearchService {
  searchTerm$ = new BehaviorSubject<string>('');
  updateSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }
}

class MockProductService {
  isLoading$ = new BehaviorSubject<boolean>(false);
  setActiveCategory = jasmine.createSpy('setActiveCategory');
  getFiltersForCategory() {
    return of({
      attributes: new Map<string, Set<string>>(),
      minPrice: 0,
      maxPrice: 100,
    });
  }
  getPaginatedAndFilteredProducts() {
    return of({ products: [{ p_id: '1' }], totalCount: 1 });
  }
}
class MockAddressService {
  getSelectedAddress() {
    return of({ location: 'India' });
  }
}
class MockUserService {
  cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();
  wishlistSubject = new BehaviorSubject<any[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();
  getCurrentUser() {
    return of({ cart: [], wishList: [] });
  }
  addToCart() {
    return of({});
  }
  toggleWishlist() {
    return of({ added: true });
  }
}

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent, NoopAnimationsModule],
      providers: [
        { provide: ProductService, useClass: MockProductService },
        { provide: SearchService, useClass: MockSearchService },
        { provide: AddressService, useClass: MockAddressService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial category products', () => {
    expect(component).toBeTruthy();
    expect(component.activeProducts?.length).toBe(1);
  });

  it('should react to search term changes resetting page', () => {
    const search = TestBed.inject(SearchService) as any as MockSearchService;
    component['currentPage'] = 5;
    search.updateSearchTerm('bike');
    expect(component['currentPage']).toBe(0);
  });
});
