import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header.component';
import { BehaviorSubject, of } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address/address.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';

class MockSearchService {
  updateSearchTerm = jasmine.createSpy('updateSearchTerm');
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}
class MockAuthService {
  logout = jasmine.createSpy('logout');
}
class MockDialog {
  open(data?: any) {
    return { afterClosed: () => of(data?.data?.addresses?.[0] || null) };
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
  setSelectedAddress(addr: any) {
    this.selected$.next(addr);
  }
}
class MockUserService {
  cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: MockRouter;
  let search: MockSearchService;
  let auth: MockAuthService;
  let address: MockAddressService;
  let user: MockUserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        { provide: SearchService, useClass: MockSearchService },
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockDialog },
        { provide: AddressService, useClass: MockAddressService },
        { provide: UserService, useClass: MockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as any;
    search = TestBed.inject(SearchService) as any;
    auth = TestBed.inject(AuthService) as any;
    address = TestBed.inject(AddressService) as any;
    user = TestBed.inject(UserService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggleSearch should invert flag', () => {
    const initial = component['isSearchVisible'];
    component.toggleSearch();
    expect(component['isSearchVisible']).toBe(!initial);
  });

  it('onSearch should call updateSearchTerm and hide on mobile', () => {
    (window as any).innerWidth = 500; // simulate mobile
    component['searchControl'].setValue('bike');
    component.onSearch();
    expect(search.updateSearchTerm).toHaveBeenCalledWith('bike');
    expect(component['isSearchVisible']).toBeFalse();
  });

  it('onSearch should not hide search on desktop', () => {
    (window as any).innerWidth = 1200;
    component['isSearchVisible'] = true;
    component['searchControl'].setValue('car');
    component.onSearch();
    expect(search.updateSearchTerm).toHaveBeenCalledWith('car');
    expect(component['isSearchVisible']).toBeTrue();
  });

  it('navigation helpers should call router.navigate', () => {
    component.goToCart();
    component.goToWishlist();
    component.goToHome();
    expect(router.navigate).toHaveBeenCalledWith(['/cart']);
    expect(router.navigate).toHaveBeenCalledWith(['/wishlist']);
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('logOut should call authService.logout and navigate', () => {
    component.logOut();
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('cartDisplay should return empty string when no cart items', () => {
    user.cartSubject.next([]);
    expect(component.cartDisplay).toBe('');
  });

  it('cartDisplay should return proper count when <= 9', () => {
    user.cartSubject.next([{ quantity: 3 }, { quantity: 2 }]);
    expect(component.cartDisplay).toBe('5');
  });

  it('cartDisplay should return "9+" when > 9', () => {
    user.cartSubject.next([{ quantity: 10 }]);
    expect(component.cartDisplay).toBe('9+');
  });

  it('should update addresses and currency symbol from service', () => {
    expect(component['addresses'].length).toBe(1);
    expect(component['selectedAddress'].location).toBe('India');
    expect(component['currencySymbol']).toBe('₹');
  });


  it('checkScreenSize should set isMobile properly', () => {
    (window as any).innerWidth = 500;
    component.checkScreenSize();
    expect(component['isMobile']).toBeTrue();

    (window as any).innerWidth = 1200;
    component.checkScreenSize();
    expect(component['isMobile']).toBeFalse();
  });

  it('onResize should call checkScreenSize', () => {
    spyOn(component, 'checkScreenSize');
    component.onResize();
    expect(component.checkScreenSize).toHaveBeenCalled();
  });
});
