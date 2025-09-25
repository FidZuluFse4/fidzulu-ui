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
  it('should build form and emit default values on init', () => {
    spyOn(component.filterChange, 'emit');
    component.ngOnInit();
    component.ngOnChanges({ attributes: true, maxPrice: true } as any);
    expect(component.filterForm).toBeTruthy();
    expect(component.filterChange.emit).toHaveBeenCalledWith(component.filterForm.value);
  });

  it('should clear filters and rebuild form', () => {
    const spy = spyOn<any>(component as any, 'buildForm').and.callThrough();
    component.clearFilters();
    expect(spy).toHaveBeenCalled();
  });

  it('should set currency symbol based on location', () => {
    expect(component["locationToSymbol"]('India')).toBe('₹');
    expect(component["locationToSymbol"]('IRELAND')).toBe('€');
    expect(component["locationToSymbol"]('usa')).toBe('$');
    expect(component["locationToSymbol"]('united states')).toBe('$');
    expect(component["locationToSymbol"]('')).toBe('$');
    expect(component["locationToSymbol"](undefined)).toBe('$');
    expect(component["locationToSymbol"]('random')).toBe('$');
  });

  it('should format group label correctly', () => {
    expect(component["formatGroupLabel"]('Brand')).toBe('Brand');
    expect(component["formatGroupLabel"]('brand_name')).toBe('Brand Name');
    expect(component["formatGroupLabel"]('brandName')).toBe('Brand Name');
    expect(component["formatGroupLabel"]('')).toBe('');
  });

  it('should format option value correctly', () => {
    expect(component["formatOptionValue"]('sony_tv')).toBe('Sony Tv');
    expect(component["formatOptionValue"]('sonyTv')).toBe('Sony Tv');
    expect(component["formatOptionValue"]('0')).toBe('0');
    expect(component["formatOptionValue"](null)).toBe('');
    expect(component["formatOptionValue"](undefined)).toBe('');
    expect(component["formatOptionValue"]('')).toBe('');
  });

  it('should check if filter is active (price branch)', () => {
    component.maxPrice = 1000;
    component.isFilterActive = false;
    component["checkIfFilterIsActive"]({ price: 900 });
    expect(component.isFilterActive).toBeTrue();
  });

  it('should check if filter is active (checkbox branch)', () => {
    component.maxPrice = 1000;
    component.isFilterActive = false;
    component["checkIfFilterIsActive"]({ price: 1000, foo: true });
    expect(component.isFilterActive).toBeTrue();
  });

  it('should check if filter is not active', () => {
    component.maxPrice = 1000;
    component.isFilterActive = true;
    component["checkIfFilterIsActive"]({ price: 1000, foo: false });
    expect(component.isFilterActive).toBeFalse();
  });

  it('should build cleanedGroups and controls for valid attributes', () => {
    // Only use Set<string> for type safety
    const attrs = new Map([
      ['Brand', new Set(['Sony', 'Samsung', '', 'null'])],
      ['Type', new Set(['LED', 'OLED'])],
    ]);
    component.attributes = attrs;
    component.maxPrice = 500;
    (component as any).buildForm();
    expect(component.cleanedGroups.length).toBe(2);
    expect(component.filterForm.contains('Brand___SEP___Sony')).toBeTrue();
    expect(component.filterForm.contains('Type___SEP___LED')).toBeTrue();
    expect(component.filterForm.contains('Brand___SEP___null')).toBeFalse();
  });

  it('should not add controls for empty/invalid attribute options', () => {
    // Only use Set<string> for type safety
    const attrs = new Map([
      ['Empty', new Set(['', 'null'])],
    ]);
    component.attributes = attrs;
    component.maxPrice = 100;
    (component as any).buildForm();
    expect(component.cleanedGroups.length).toBe(0);
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    (component as any).formSubscription = { unsubscribe: jasmine.createSpy('unsubscribe') };
    (component as any).addressSub = { unsubscribe: jasmine.createSpy('unsubscribe') };
    component.ngOnDestroy();
    expect((component as any).formSubscription.unsubscribe).toHaveBeenCalled();
    expect((component as any).addressSub.unsubscribe).toHaveBeenCalled();
  });

  it('should emit filterChange on valueChanges', () => {
    (component as any).buildForm();
    spyOn(component.filterChange, 'emit');
    component.filterForm.patchValue({ price: 123 });
    expect(component.filterChange.emit).toHaveBeenCalledWith(jasmine.objectContaining({ price: 123 }));
  });

  it('should generate unique control names', () => {
    expect(component.controlName('Brand', 'Sony')).toBe('Brand___SEP___Sony');
  });

  // Negative: attributes is empty map
  it('should handle empty attributes map', () => {
    component.attributes = new Map();
    (component as any).buildForm();
    expect(component.cleanedGroups.length).toBe(0);
  });

  // Negative: attributes with only invalid options
  it('should handle attributes with only invalid options', () => {
    // Only use Set<string> for type safety
    component.attributes = new Map([
      ['Invalid', new Set(['', 'null'])],
    ]);
    (component as any).buildForm();
    expect(component.cleanedGroups.length).toBe(0);
  });

  // Negative: locationToSymbol with unknown location
  it('should return $ for unknown location', () => {
    expect(component["locationToSymbol"]('xyz')).toBe('$');
  });
});
