import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutRouteComponent } from './about-route.component';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address/address.service';
import { UserService } from '../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { TeamService } from '../../services/team.service';
import { ProductService } from '../../services/product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
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
class MockTeamService {
  getTeams() {
    return of([]);
  }
  getTeamsForCategory() {
    return of([]);
  }
}
class MockProductService {
  getFiltersForCategory() {
    return of({ attributes: new Map(), minPrice: 0, maxPrice: 1000 });
  }
  getPaginatedAndFilteredProducts() {
    return of({ products: [], totalCount: 0 });
  }
  setActiveCategory() {}
  isLoading$ = new BehaviorSubject(false);
}
class MockSnackBar {
  open() {
    return { afterDismissed: () => of(null) };
  }
}

describe('AboutRouteComponent', () => {
  let component: AboutRouteComponent;
  let fixture: ComponentFixture<AboutRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutRouteComponent, NoopAnimationsModule],
      providers: [
        { provide: SearchService, useClass: MockSearchService },
        { provide: Router, useClass: MockRouter },
        { provide: AuthService, useClass: MockAuthService },
        { provide: MatDialog, useClass: MockDialog },
        { provide: AddressService, useClass: MockAddressService },
        { provide: UserService, useClass: MockUserService },
        { provide: TeamService, useClass: MockTeamService },
        { provide: ProductService, useClass: MockProductService },
        { provide: MatSnackBar, useClass: MockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
