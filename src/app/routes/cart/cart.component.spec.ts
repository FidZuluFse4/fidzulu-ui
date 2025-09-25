import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address/address.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../../services/product.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockSearchService {
  updateSearchTerm() {}
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
  increaseQuantity() {}
  decreaseQuantity() {}
  removeItem() {}
  removeFromCart() {
    return of({});
  }
  updateCart() {
    return of({});
  }
  addToCart() {
    return of({});
  }
}
class MockProductService {
  getAllProducts() {
    return of([]);
  }
}

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent, NoopAnimationsModule],
      providers: [
        { provide: SearchService, useClass: MockSearchService },
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockDialog },
        { provide: AddressService, useClass: MockAddressService },
        { provide: UserService, useClass: MockUserService },
        { provide: MatSnackBar, useClass: MockSnackBar },
        { provide: ProductService, useClass: MockProductService },
        // Fallback HttpClient mock to prevent real UserService (if instantiated) from throwing
        { provide: HttpClient, useValue: { get: () => of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
