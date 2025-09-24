import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressDialogComponent } from './address-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Simple mock dialog ref
class MockDialogRef {
  close = jasmine.createSpy('close');
}

function makeAddress(partial: Partial<any> = {}) {
  return {
    ['id']: (partial as any)['id'] || Date.now().toString(),
    ['location']: (partial as any)['location'] || 'India',
    ['full_addr']: (partial as any)['full_addr'] || '123 Street, City, Country',
  } as any;
}

describe('AddressDialogComponent (logic)', () => {
  let component: AddressDialogComponent;
  let fixture: ComponentFixture<AddressDialogComponent>;
  let dialogRef: MockDialogRef;

  const initialAddresses = [
    makeAddress({ id: '1', location: 'India' }),
    makeAddress({ id: '2', location: 'USA' }),
  ];

  beforeEach(async () => {
    dialogRef = new MockDialogRef();

    await TestBed.configureTestingModule({
      imports: [AddressDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            addresses: initialAddresses,
            selectedAddress: initialAddresses[0],
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create & seed usedCountries', () => {
    expect(component).toBeTruthy();
    expect(component.usedCountries['India']).toBeTrue();
    expect(component.usedCountries['USA']).toBeTrue();
  });

  it('onSelectAddress should close with selected address', () => {
    component.selectedAddressIndex.setValue(1);
    component.onSelectAddress();
    expect(dialogRef.close).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: '2' })
    );
  });

  it('selectAddress should update selected index', () => {
    component.selectAddress(1);
    expect(component.selectedAddressIndex.value).toBe(1);
  });

  it('onRadioChange should update selected index', () => {
    component.onRadioChange({ value: 0 });
    expect(component.selectedAddressIndex.value).toBe(0);
  });

  it('toggleAddNewAddress should flip flag, reset editing & form', () => {
    component.newAddress.full_addr = 'mutated';
    component.toggleAddNewAddress();
    expect(component.isAddingNewAddress).toBeTrue();
    expect(component.isEditingAddress).toBeFalse();
    expect(component.newAddress.full_addr).toBe('');
  });

  it('toggleEditAddress should enable editing and clone address', () => {
    component.toggleEditAddress(0);
    expect(component.isEditingAddress).toBeTrue();
    expect(component.editingAddressIndex).toBe(0);
    // Mutate form copy and ensure original array element is untouched
    component.newAddress.full_addr = 'Changed Address, City';
    expect(component.addresses[0].full_addr).not.toBe('Changed Address, City');
  });

  it('addNewAddress should replace existing country address', () => {
    component.toggleAddNewAddress();
    component.newAddress = {
      location: 'India', // already exists
      full_addr: '456 New Road, New City, New Country',
      id: 'NEW',
    } as any;
    component.addNewAddress();
    const indiaIndex = component.addresses.findIndex(
      (a) => a.location === 'India'
    );
    expect(indiaIndex).toBeGreaterThan(-1);
    expect(component.addresses[indiaIndex].full_addr).toContain('456 New Road');
    expect(component.isAddingNewAddress).toBeFalse();
  });

  it('addNewAddress should append new country address', () => {
    component.toggleAddNewAddress();
    component.newAddress = {
      location: 'Ireland',
      full_addr: '789 Avenue, Dublin, Ireland',
      id: 'IR',
    } as any;
    component.addNewAddress();
    expect(
      component.addresses.some((a) => a.location === 'Ireland')
    ).toBeTrue();
  });

  it('isValidAddress should enforce rules', () => {
    expect(
      component.isValidAddress({ location: '', full_addr: '' } as any)
    ).toBeFalse();
    expect(
      component.isValidAddress({
        location: 'India',
        full_addr: 'TooShort',
      } as any)
    ).toBeFalse();
    expect(
      component.isValidAddress({
        location: 'India',
        full_addr: 'NoCommaAddressLongEnough',
      } as any)
    ).toBeFalse();
    expect(
      component.isValidAddress({
        location: 'India',
        full_addr: '123 Road, City Name',
      } as any)
    ).toBeTrue();
  });

  it('canAddNewAddress should reflect used countries count', () => {
    // Currently have India + USA; available: 3 => can add (Ireland)
    expect(component.canAddNewAddress()).toBeTrue();
    // Add Ireland
    component.toggleAddNewAddress();
    component.newAddress = {
      location: 'Ireland',
      full_addr: '123 Road, Dublin',
    } as any;
    component.addNewAddress();
    expect(component.canAddNewAddress()).toBeFalse();
  });

  it('isCountryAvailable logic when adding & editing', () => {
    // Adding scenario: existing India should be unavailable
    expect(component.isCountryAvailable('India')).toBeFalse();
    // Enter edit mode for India
    component.toggleEditAddress(0);
    expect(component.isCountryAvailable('India')).toBeTrue(); // original allowed
  });

  it('getAvailableCountries should exclude used (adding) and include original when editing', () => {
    const addingList = component.getAvailableCountries();
    expect(addingList).not.toContain('India');
    component.toggleEditAddress(0); // edit India
    const editingList = component.getAvailableCountries();
    expect(editingList).toContain('India');
  });

  it('saveEditedAddress should update address & handle country change collision', () => {
    // Ensure Ireland is free first
    if (!component.addresses.some((a) => a.location === 'Ireland')) {
      component.toggleAddNewAddress();
      component.newAddress = {
        location: 'Ireland',
        full_addr: '100 Some Rd, Dublin',
      } as any;
      component.addNewAddress();
    }
    // Now edit USA -> Ireland (collision). This should remove old Ireland and keep single Ireland entry updated.
    const originalIrelandCount = component.addresses.filter(
      (a) => a.location === 'Ireland'
    ).length;
    const usaIndex = component.addresses.findIndex((a) => a.location === 'USA');
    component.toggleEditAddress(usaIndex);
    component.newAddress = {
      ...component.newAddress,
      location: 'Ireland',
      full_addr: 'Updated Addr, Dublin, IE',
    } as any;
    component.saveEditedAddress();
    const newIrelandCount = component.addresses.filter(
      (a) => a.location === 'Ireland'
    ).length;
    expect(newIrelandCount).toBeLessThanOrEqual(originalIrelandCount); // collision resolved
    expect(
      component.addresses.some((a) => a.full_addr.includes('Updated Addr'))
    ).toBeTrue();
  });

  it('deleteAddress should not remove last address & should adjust selection', () => {
    const startLength = component.addresses.length;
    component.deleteAddress(0);
    expect(component.addresses.length).toBe(startLength - 1); // one removed
    // Remove until one left
    while (component.addresses.length > 1) {
      component.deleteAddress(0);
    }
    const lenBefore = component.addresses.length;
    component.deleteAddress(0); // attempt removing last
    expect(component.addresses.length).toBe(lenBefore); // unchanged
  });
});
