import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { AddressService } from '../../services/address/address.service';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

class MockUserService {
  cart$ = new BehaviorSubject<any[]>([]).asObservable();
  updateCart() {
    return of({});
  }
  removeFromCart() {
    return of({});
  }
  checkoutCart() {
    return of({});
  }
  getCurrentUser() {
    return of({ cart: [] });
  }
}
class MockProductService {
  getAllProducts() {
    return of([]);
  }
}
class MockAddressService {
  private selected$ = new BehaviorSubject<any>({ location: 'India' });
  getSelectedAddress() {
    return this.selected$.asObservable();
  }
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        { provide: UserService, useClass: MockUserService },
        { provide: ProductService, useClass: MockProductService },
        { provide: AddressService, useClass: MockAddressService },
        { provide: Router, useClass: MockRouter },
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
