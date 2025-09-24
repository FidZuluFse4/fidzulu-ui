import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProductDetailsComponent } from './product-details.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../models/product.model';

// Mocks
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}
class MockSnackBar {
  open = jasmine.createSpy('open');
}

class MockActivatedRoute {
  private paramsSubj = new BehaviorSubject<any>({ id: 'p1' });
  params = this.paramsSubj.asObservable();
  setId(id: string) {
    this.paramsSubj.next({ id });
  }
}

const mockProduct: Product = {
  p_id: 'p1',
  p_type: 'Bike',
  p_name: 'Road Bike',
  p_price: 100,
  p_currency: '$',
  p_img_url: 'single.jpg',
  attribute: { images: 'a.jpg,b.jpg' },
  p_quantity: 5,
} as any;

class MockProductService {
  getProductById(id: string) {
    return of(mockProduct);
  }
}

interface CartEntry {
  p_id: string;
  quantity: number;
}
class MockUserService {
  private user: { cart: CartEntry[]; wishList: Product[] } = {
    cart: [],
    wishList: [],
  };
  getCurrentUser() {
    return of(this.user);
  }
  addToCart = jasmine
    .createSpy('addToCart')
    .and.callFake((pid: string, q: number) => {
      const existing = this.user.cart.find((o) => o.p_id === pid);
      if (existing) existing.quantity = q;
      else this.user.cart.push({ p_id: pid, quantity: q });
      return of({});
    });
  removeFromCart = jasmine
    .createSpy('removeFromCart')
    .and.callFake((pid: string) => {
      this.user.cart = this.user.cart.filter((o) => o.p_id !== pid);
      return of({});
    });
  addToWishlist = jasmine
    .createSpy('addToWishlist')
    .and.callFake((pid: string) => {
      if (!this.user.wishList.some((p) => p.p_id === pid))
        this.user.wishList.push({ ...mockProduct });
      return of({});
    });
  removeFromWishlist = jasmine
    .createSpy('removeFromWishlist')
    .and.callFake((pid: string) => {
      this.user.wishList = this.user.wishList.filter((p) => p.p_id !== pid);
      return of({});
    });
}

describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;
  let userService: MockUserService;
  let route: MockActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: Router, useClass: MockRouter },
        { provide: ProductService, useClass: MockProductService },
        { provide: UserService, useClass: MockUserService },
        { provide: MatSnackBar, useClass: MockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as any;
    route = TestBed.inject(ActivatedRoute) as any;
    fixture.detectChanges();
  });

  it('should create and load product + images', () => {
    expect(component).toBeTruthy();
    expect(component.product?.p_id).toBe('p1');
    expect(component.images.length).toBe(2); // parsed from attribute images
  });

  it('select / prev / next navigation cycles indices', () => {
    component.select(1);
    expect((component as any).selectedIndex).toBe(1);
    component.next();
    expect((component as any).selectedIndex).toBe(0); // wrap
    component.prev();
    expect((component as any).selectedIndex).toBe(1); // wrap back
  });

  it('addToCart initializes quantity and calls service', () => {
    component.addToCart();
    expect(component.productQuantity).toBe(1);
    expect(userService.addToCart).toHaveBeenCalledWith('p1', 1);
  });

  it('increase increments quantity and updates cart', () => {
    component.addToCart();
    component.increase();
    expect(component.productQuantity).toBe(2);
    expect(userService.addToCart).toHaveBeenCalledWith('p1', 2);
  });

  it('decrease removes from cart when reaches zero', () => {
    component.addToCart(); // 1
    component.decrease(); // becomes 0 -> removed
    expect(component.productQuantity).toBeUndefined();
    expect(userService.removeFromCart).toHaveBeenCalledWith('p1');
  });

  it('wishlist add then remove toggles flag', () => {
    expect(component.isInWishlist()).toBeFalse();
    component.addToWishlist(); // add
    expect(component.isInWishlist()).toBeTrue();
    component.addToWishlist(); // remove
    expect(component.isInWishlist()).toBeFalse();
  });
});
