import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address/address.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockSearchService {
  searchTerm$ = new BehaviorSubject<string>('');
  updateSearchTerm(term: string = '') {
    this.searchTerm$.next(term);
  }
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}
class MockAuthService {
  logout() {}
}
class MockDialog {
  open() {
    return { afterClosed: () => of(null) };
  }
}
class MockSnackBar {
  open() {
    return { afterDismissed: () => of(null) };
  }
}
class MockAddressService {
  private addresses$ = new BehaviorSubject<any[]>([
    { id: '1', location: 'India', full_addr: 'Addr', isDefault: true },
  ]);
  private selected$ = new BehaviorSubject<any>({
    id: '1',
    location: 'India',
    full_addr: 'Addr',
    isDefault: true,
  });
  getAddresses() {
    return this.addresses$.asObservable();
  }
  getSelectedAddress() {
    return this.selected$.asObservable();
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
class MockProductService {
  isLoading$ = new BehaviorSubject<boolean>(false);
  setActiveCategory() {}
  getFiltersForCategory() {
    return of({ attributes: new Map(), minPrice: 0, maxPrice: 1000 });
  }
  getPaginatedAndFilteredProducts() {
    return of({ products: [], totalCount: 0 });
  }
}

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, NoopAnimationsModule],
      providers: [
        { provide: SearchService, useClass: MockSearchService },
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockDialog },
        { provide: AddressService, useClass: MockAddressService },
        { provide: UserService, useClass: MockUserService },
        { provide: MatSnackBar, useClass: MockSnackBar },
        { provide: ProductService, useClass: MockProductService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
