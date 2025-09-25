import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductGridComponent } from './product-grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { fakeAsync, tick, flush } from '@angular/core/testing';
import { Product } from '../../../models/product.model';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Mock Router
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

// Minimal mock of UserService focusing on the API used by component
class MockUserService {
  cartSubject = new BehaviorSubject<any[]>([]);
  wishlistSubject = new BehaviorSubject<Product[]>([]);
  cart$ = this.cartSubject.asObservable();
  wishlist$ = this.wishlistSubject.asObservable();

  getCurrentUser() {
    return of({ id: '1' });
  }

  addToCart = jasmine
    .createSpy('addToCart')
    .and.callFake((p_id: string, quantity: number) => {
      const existing = this.cartSubject.value.find((c) => c.p_id === p_id);
      if (existing) {
        existing.quantity = quantity;
      } else {
        this.cartSubject.next([
          ...this.cartSubject.value,
          { o_id: Date.now().toString(), p_id, quantity },
        ]);
      }
      return of({ success: true });
    });

  toggleWishlist = jasmine
    .createSpy('toggleWishlist')
    .and.callFake((product: Product) => {
      const exists = this.wishlistSubject.value.find(
        (p) => p.p_id === product.p_id
      );
      if (exists) {
        this.wishlistSubject.next(
          this.wishlistSubject.value.filter((p) => p.p_id !== product.p_id)
        );
        return of({ added: false });
      } else {
        this.wishlistSubject.next([
          ...this.wishlistSubject.value,
          { ...product },
        ]);
        return of({ added: true });
      }
    });
}

// Provide a plain object with spy to avoid Angular Material internals scheduling timers
const snackBarSpy = { open: jasmine.createSpy('open') };

describe('ProductGridComponent', () => {
  let component: ProductGridComponent;
  let fixture: ComponentFixture<ProductGridComponent>;
  let userService: MockUserService;
  let snackBar: any;
  let router: MockRouter;

  const sampleProducts: Product[] = [
    {
      p_id: 'p1',
      p_type: 'Bike',
      p_name: 'Road Bike',
      p_price: 100,
      p_currency: '$',
      p_img_url: 'img1.jpg',
      attribute: {},
      p_quantity: 10,
    } as any,
    {
      p_id: 'p2',
      p_type: 'Bike',
      p_name: 'City Bike',
      p_price: 80,
      p_currency: '$',
      p_img_url: 'img2.jpg',
      attribute: {},
      p_quantity: 4,
    } as any,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductGridComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useClass: MockRouter },
        { provide: UserService, useClass: MockUserService },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductGridComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as any;
    snackBar = TestBed.inject(MatSnackBar) as any;
    router = TestBed.inject(Router) as any;

    component.products = sampleProducts;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should seed wishlistIds and quantities on init when streams emit', () => {
    // simulate existing wishlist and cart
    userService.wishlistSubject.next([sampleProducts[0]]);
    userService.cartSubject.next([{ p_id: 'p2', quantity: 3 }]);
    component.ngOnInit();
    expect(component.wishlistIds.has('p1')).toBeTrue();
    expect(component.getQuantity(sampleProducts[1])).toBe(3);
  });

  it('trackByProductId should return product id', () => {
    const id = component.trackByProductId(0, sampleProducts[0]);
    expect(id).toBe('p1');
  });

  it('goToProductDetails should navigate with product id', () => {
    component.goToProductDetails('p1');
    expect(router.navigate).toHaveBeenCalledWith(['/product', 'p1']);
  });

  it('addToCart should set quantity to 1 and call service', () => {
    component.addToCart(sampleProducts[0]);
    expect(component.getQuantity(sampleProducts[0])).toBe(1);
    expect(userService.addToCart).toHaveBeenCalledWith('p1', 1);
  });

  it('increaseQuantity should increment and call service each time', () => {
    component.addToCart(sampleProducts[0]); // sets to 1
    component.increaseQuantity(sampleProducts[0]); // to 2
    expect(component.getQuantity(sampleProducts[0])).toBe(2);
    expect(userService.addToCart).toHaveBeenCalledWith('p1', 2);
  });

  it('decreaseQuantity should reduce quantity and remove when zero without calling addToCart at zero', () => {
    component.addToCart(sampleProducts[0]); // 1
    const initialCallCount = userService.addToCart.calls.count();
    component.decreaseQuantity(sampleProducts[0]); // to 0 -> should not call addToCart for 0
    expect(component.getQuantity(sampleProducts[0])).toBe(0);
    const afterCallCount = userService.addToCart.calls.count();
    expect(afterCallCount).toBe(initialCallCount); // no extra call when zero
  });

  it('addToWishlist should toggle add then remove updating wishlistIds', fakeAsync(() => {
    component.addToWishlist(sampleProducts[0]); // add
    tick();
    expect(userService.toggleWishlist).toHaveBeenCalledTimes(1);
    expect(component.wishlistIds.has('p1')).toBeTrue();

    component.addToWishlist(sampleProducts[0]); // remove
    tick();
    expect(userService.toggleWishlist).toHaveBeenCalledTimes(2);
    expect(component.wishlistIds.has('p1')).toBeFalse();
    flush();
  }));

  it('addToWishlist should handle error without mutating wishlistIds', fakeAsync(() => {
    userService.toggleWishlist.and.returnValue(
      throwError(() => new Error('fail'))
    );
    component.addToWishlist(sampleProducts[1]);
    tick();
    expect(component.wishlistIds.has('p2')).toBeFalse();
    flush();
  }));
});
