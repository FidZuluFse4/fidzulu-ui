import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WishListComponent } from './wish-list.component';
import { BehaviorSubject, of } from 'rxjs';
import { Product } from '../../models/product.model';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AddressService } from '../../services/address/address.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}
class MockSnackBar {
  open = jasmine.createSpy('open');
}

class MockAddressService {
  private addr$ = new BehaviorSubject<any>({ location: 'India' });
  getSelectedAddress() {
    return this.addr$.asObservable();
  }
  emit(loc: string) {
    this.addr$.next({ location: loc });
  }
}

class MockUserService {
  wishlistSubject = new BehaviorSubject<Product[]>([]);
  cartSubject = new BehaviorSubject<any[]>([]);
  wishlist$ = this.wishlistSubject.asObservable();
  cart$ = this.cartSubject.asObservable();
  getCurrentUser() {
    return of({
      cart: this.cartSubject.value,
      wishList: this.wishlistSubject.value,
    });
  }
  addToCart = jasmine
    .createSpy('addToCart')
    .and.callFake((pid: string, q: number) => {
      const existing = this.cartSubject.value.find((c) => c.p_id === pid);
      if (existing) existing.quantity = q;
      else
        this.cartSubject.next([
          ...this.cartSubject.value,
          { p_id: pid, quantity: q },
        ]);
      return of({});
    });
  removeFromWishlist = jasmine
    .createSpy('removeFromWishlist')
    .and.callFake((pid: string) => {
      this.wishlistSubject.next(
        this.wishlistSubject.value.filter((p) => p.p_id !== pid)
      );
      return of({});
    });
  toggleWishlist() {
    return of({ added: true });
  }
}

describe('WishListComponent', () => {
  let component: WishListComponent;
  let fixture: ComponentFixture<WishListComponent>;
  let userService: MockUserService;
  let addressService: MockAddressService;

  const makeProduct = (id: number): Product =>
    ({
      p_id: 'p' + id,
      p_type: 'Bike',
      p_name: 'Prod ' + id,
      p_price: id * 10,
      p_currency: '$',
      p_img_url: 'x.jpg',
      attribute: {},
      p_quantity: 0,
    } as any);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishListComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: UserService, useClass: MockUserService },
        { provide: AddressService, useClass: MockAddressService },
        { provide: MatSnackBar, useClass: MockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishListComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as any;
    addressService = TestBed.inject(AddressService) as any;

    // seed wishlist with 8 items to test pagination (pageSize default 6)
    userService.wishlistSubject.next(
      Array.from({ length: 8 }, (_, i) => makeProduct(i + 1))
    );
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pagedWishlist should respect page size and index', () => {
    expect(component.pagedWishlist.length).toBe(6); // first page
    component.onPageChange({ pageIndex: 1, pageSize: 6, length: 8 } as any);
    expect(component.pagedWishlist.length).toBe(2); // remaining
  });

  it('addToCart sets quantity and calls service', () => {
    const prod = userService.wishlistSubject.value[0];
    component.addToCart(prod);
    expect(component.quantities[prod.p_id]).toBe(1);
    expect(userService.addToCart).toHaveBeenCalledWith(prod.p_id, 1);
  });

  it('increaseQuantity increments and calls service', () => {
    const prod = userService.wishlistSubject.value[1];
    component.addToCart(prod);
    component.increaseQuantity(prod);
    expect(component.quantities[prod.p_id]).toBe(2);
    expect(userService.addToCart).toHaveBeenCalledWith(prod.p_id, 2);
  });

  it('decreaseQuantity stops at zero and does not call service for zero', () => {
    const prod = userService.wishlistSubject.value[2];
    component.addToCart(prod); // 1
    const callsBefore = userService.addToCart.calls.count();
    component.decreaseQuantity(prod); // becomes 0 -> not sent
    expect(component.quantities[prod.p_id]).toBeUndefined();
    expect(userService.addToCart.calls.count()).toBe(callsBefore); // no new call
  });

  it('removeFromWishlist updates list', () => {
    const prod = userService.wishlistSubject.value[0];
    component.removeFromWishlist(prod.p_id);
    expect(userService.removeFromWishlist).toHaveBeenCalled();
    expect(
      component.wishlist.find((p) => p.p_id === prod.p_id)
    ).toBeUndefined();
  });

  it('currency symbol updates with address change', () => {
    expect(component.currencySymbol).toBe('₹'); // India
    addressService.emit('USA');
    expect(component.currencySymbol).toBe('$');
  });
});
