import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailsRouteComponent } from './product-details-route.component';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address/address.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductService } from '../../services/product.service';

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
  cart$ = new BehaviorSubject<any[]>([]).asObservable();
  cartSubject = new BehaviorSubject<any[]>([]);
}
class MockActivatedRoute {
  params = of({ id: 'p1' });
}
class MockProductService {
  getProductById() {
    return of({
      p_id: 'p1',
      p_type: 'Bike',
      p_name: 'Road',
      p_price: 100,
      attribute: {},
      p_quantity: 1,
    });
  }
}

describe('ProductDetailsRouteComponent', () => {
  let component: ProductDetailsRouteComponent;
  let fixture: ComponentFixture<ProductDetailsRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsRouteComponent, NoopAnimationsModule],
      providers: [
        { provide: SearchService, useClass: MockSearchService },
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockDialog },
        { provide: AddressService, useClass: MockAddressService },
        { provide: UserService, useClass: MockUserService },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: ProductService, useClass: MockProductService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
