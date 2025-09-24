import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Address } from '../../models/address.model';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
})
export class AddressDialogComponent {
  addresses: Address[] = [];
  selectedAddressIndex = new FormControl(0);

  // For adding/editing addresses
  isAddingNewAddress = false;
  isEditingAddress = false;
  editingAddressIndex: number | null = null;

  // New address form data
  newAddress: Address = {
    location: '',
    full_addr: '',
  };

  // Available locations (countries)
  availableLocations = ['India', 'Ireland', 'USA'];

  // Track which countries already have addresses
  usedCountries: { [country: string]: boolean } = {};

  constructor(
    public dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { addresses: Address[]; selectedAddress: Address | null }
  ) {
    // Use the addresses from data
    this.addresses = [...data.addresses];

    // Populate used countries
    this.updateUsedCountries();

    // Find the selected address
    if (data.selectedAddress) {
      const index = this.addresses.findIndex(
        (addr) => addr.id === data.selectedAddress?.id
      );

      if (index !== -1) {
        this.selectedAddressIndex.setValue(index);
      }
    }
  }

  // Track which countries are already used
  updateUsedCountries(): void {
    // Clear the previous state
    this.usedCountries = {};

    // Rebuild based on current addresses
    this.addresses.forEach((address) => {
      if (address && address.location) {
        this.usedCountries[address.location] = true;
      }
    });

    console.log('Updated used countries:', this.usedCountries);
    console.log('Available countries count:', this.availableLocations.length);
    console.log(
      'Used countries count:',
      Object.keys(this.usedCountries).length
    );
  }

  onSelectAddress(): void {
    const index = this.selectedAddressIndex.value ?? 0;
    const selectedAddress = this.addresses[index];
    this.dialogRef.close(selectedAddress);
  }

  // Centralized selection handler so clicking a row or radio is consistent
  selectAddress(index: number): void {
    this.selectedAddressIndex.setValue(index);
  }

  // Called when mat-radio-group value changes
  onRadioChange(event: any): void {
    const index = event.value;
    this.selectedAddressIndex.setValue(index);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  toggleAddNewAddress(): void {
    this.isAddingNewAddress = !this.isAddingNewAddress;
    this.isEditingAddress = false;
    this.editingAddressIndex = null;

    // Reset form data
    this.resetFormData();
  }

  toggleEditAddress(index: number): void {
    this.isEditingAddress = !this.isEditingAddress;
    this.isAddingNewAddress = false;

    if (this.isEditingAddress) {
      this.editingAddressIndex = index;
      const address = this.addresses[index];

      // Copy address data to form
      this.newAddress = { ...address };
    } else {
      this.editingAddressIndex = null;
      this.resetFormData();
    }
  }

  addNewAddress(): void {
    if (!this.isValidAddress(this.newAddress)) return;

    // Check if country already has an address
    const isCountryAlreadyUsed = this.addresses.some(
      (addr) => addr.location === this.newAddress.location
    );

    // If country already has an address, replace it
    if (isCountryAlreadyUsed) {
      const existingIndex = this.addresses.findIndex(
        (addr) => addr.location === this.newAddress.location
      );

      // Add ID if not present
      if (!this.newAddress.id) {
        this.newAddress.id = Date.now().toString();
      }

      // Replace existing address for this country
      this.addresses[existingIndex] = { ...this.newAddress };

      // Select the updated address
      this.selectedAddressIndex.setValue(existingIndex);
    } else {
      // Add ID if not present
      if (!this.newAddress.id) {
        this.newAddress.id = Date.now().toString();
      }

      // Add the new address to the list
      this.addresses.push({ ...this.newAddress });

      // Select the new address
      this.selectedAddressIndex.setValue(this.addresses.length - 1);
    }

    // Update used countries tracking
    this.updateUsedCountries();

    // Reset form and hide the new address form
    this.resetFormData();
    this.isAddingNewAddress = false;
  }

  saveEditedAddress(): void {
    if (
      !this.isValidAddress(this.newAddress) ||
      this.editingAddressIndex === null
    )
      return;

    // If country changed, check if it's already used
    const originalAddress = this.addresses[this.editingAddressIndex];
    const countryChanged =
      originalAddress.location !== this.newAddress.location;

    if (countryChanged) {
      const isCountryAlreadyUsed = this.addresses.some(
        (addr) =>
          addr.location === this.newAddress.location &&
          addr.id !== originalAddress.id
      );

      // If the new country already has an address, show error or replace that address
      if (isCountryAlreadyUsed) {
        // Find the existing address for the target country
        const existingIndex = this.addresses.findIndex(
          (addr) => addr.location === this.newAddress.location
        );

        // Remove the existing address for that country
        this.addresses.splice(existingIndex, 1);

        // If we're removing an address before the one we're editing, adjust the index
        if (existingIndex < this.editingAddressIndex) {
          this.editingAddressIndex--;
        }
      }
    }

    // Update the address in the list
    this.addresses[this.editingAddressIndex] = { ...this.newAddress };

    // Update used countries tracking
    this.updateUsedCountries();

    // Reset form and hide the edit form
    this.resetFormData();
    this.isEditingAddress = false;
    this.editingAddressIndex = null;
  }

  deleteAddress(index: number): void {
    if (this.addresses.length <= 1) {
      // Don't allow deleting the last address
      return;
    }

    this.addresses.splice(index, 1);

    // If we're deleting the selected address, select the first one
    if (this.selectedAddressIndex.value === index) {
      this.selectedAddressIndex.setValue(0);
    }
    // If we're deleting an address before the selected one, update the selected index
    else if (this.selectedAddressIndex.value! > index) {
      this.selectedAddressIndex.setValue(this.selectedAddressIndex.value! - 1);
    }

    // If we're editing this address, close the form
    if (this.editingAddressIndex === index) {
      this.isEditingAddress = false;
      this.editingAddressIndex = null;
      this.resetFormData();
    }

    // Update the used countries after deletion
    this.updateUsedCountries();
  }

  resetFormData(): void {
    this.newAddress = {
      location: '',
      full_addr: '',
    };
  }

  isValidAddress(address: Address): boolean {
    // More thorough validation

    // Check required fields are filled
    if (!address.location || !address.full_addr) {
      return false;
    }

    // Check full_addr has enough information (at least 10 chars)
    if (address.full_addr.trim().length < 10) {
      return false;
    }

    // Check if the address has at least 2 comma-separated parts
    const addressParts = address.full_addr.split(',');
    if (addressParts.length < 2) {
      return false;
    }

    return true;
  }

  // Check if a new address can be added (if any country is still available)
  canAddNewAddress(): boolean {
    // Check if we have fewer used countries than available countries
    const usedCountriesCount = Object.keys(this.usedCountries).length;
    const availableCount = this.availableLocations.length;
    return usedCountriesCount < availableCount;
  }

  // Check if a specific country is available for selection
  isCountryAvailable(country: string): boolean {
    if (this.isEditingAddress) {
      const originalLocation =
        this.addresses[this.editingAddressIndex!].location;
      return country === originalLocation || !this.usedCountries[country];
    } else {
      return !this.usedCountries[country];
    }
  }

  // Get available countries for adding a new address
  getAvailableCountries(): string[] {
    if (this.isEditingAddress) {
      // When editing, allow the current country plus any unused countries
      const originalLocation =
        this.addresses[this.editingAddressIndex!].location;
      return this.availableLocations.filter(
        (country) =>
          country === originalLocation || !this.usedCountries[country]
      );
    } else {
      // When adding new, show only unused countries
      return this.availableLocations.filter(
        (country) => !this.usedCountries[country]
      );
    }
  }
}
