import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSidebarComponent } from './filter-sidebar.component';
import { AddressService } from '../../../services/address/address.service';
import { BehaviorSubject } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

class MockAddressService {
  private sel$ = new BehaviorSubject<any>({ location: 'India' });
  getSelectedAddress() {
    return this.sel$.asObservable();
  }
}

describe('FilterSidebarComponent', () => {
  let component: FilterSidebarComponent;
  let fixture: ComponentFixture<FilterSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSidebarComponent, NoopAnimationsModule],
      providers: [{ provide: AddressService, useClass: MockAddressService }],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSidebarComponent);
    component = fixture.componentInstance;
    // Provide a minimal attributes map input to avoid forEach on undefined issues
    component.attributes = new Map([['Brand', new Set(['Test'])]]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
