import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Address } from '../../models/address.model';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private baseUrl = 'http://localhost:3000';

  // Default addresses
  private defaultAddresses: Address[] = [
    {
      id: '1',
      location: 'India',
      full_addr: 'B-12, Connaught Place, New Delhi, 110001, India',
      isDefault: true,
    },
    {
      id: '2',
      location: 'Ireland',
      full_addr: "45 O'Connell Street, Dublin 1, D01 NP93, Ireland",
      isDefault: false,
    },
    {
      id: '3',
      location: 'USA',
      full_addr: '350 Fifth Avenue, Manhattan, New York, NY 10118, USA',
      isDefault: false,
    },
  ];

  // BehaviorSubject to track current addresses
  private addressesSubject = new BehaviorSubject<Address[]>(
    this.defaultAddresses
  );
  private selectedAddressSubject = new BehaviorSubject<Address>(
    this.defaultAddresses[0]
  );

  constructor(private http: HttpClient) {
    // Load from localStorage if available
    this.loadAddresses();
  }

  private loadAddresses(): void {
    const storedAddresses = localStorage.getItem('addresses');
    if (storedAddresses) {
      this.addressesSubject.next(JSON.parse(storedAddresses));

      // Find the default address
      const addresses = JSON.parse(storedAddresses);
      const defaultAddress =
        addresses.find((addr: Address) => addr.isDefault) || addresses[0];
      this.selectedAddressSubject.next(defaultAddress);
    }
  }

  private saveAddresses(addresses: Address[]): void {
    localStorage.setItem('addresses', JSON.stringify(addresses));
    this.addressesSubject.next(addresses);
  }

  getAddresses(): Observable<Address[]> {
    // In a real app, you might fetch from an API
    // return this.http.get<Address[]>(`${this.baseUrl}/addresses`);
    return this.addressesSubject.asObservable();
  }

  getSelectedAddress(): Observable<Address> {
    return this.selectedAddressSubject.asObservable();
  }

  setSelectedAddress(address: Address): void {
    this.selectedAddressSubject.next(address);

    // If you want to persist this selection
    const addresses = this.addressesSubject.value;
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === address.id,
    }));
    this.saveAddresses(updatedAddresses);
  }

  addAddress(address: Address): Observable<Address> {
    // Generate a unique ID
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };

    const addresses = [...this.addressesSubject.value, newAddress];
    this.saveAddresses(addresses);

    // In a real app:
    // return this.http.post<Address>(`${this.baseUrl}/addresses`, address);
    return of(newAddress);
  }

  updateAddress(address: Address): Observable<Address> {
    const addresses = this.addressesSubject.value;
    const updatedAddresses = addresses.map((addr) =>
      addr.id === address.id ? address : addr
    );
    this.saveAddresses(updatedAddresses);

    // Update selected address if it was the one updated
    if (this.selectedAddressSubject.value.id === address.id) {
      this.selectedAddressSubject.next(address);
    }

    // In a real app:
    // return this.http.put<Address>(`${this.baseUrl}/addresses/${address.id}`, address);
    return of(address);
  }

  deleteAddress(id: string): Observable<boolean> {
    const addresses = this.addressesSubject.value;
    const filteredAddresses = addresses.filter((addr) => addr.id !== id);

    if (filteredAddresses.length < addresses.length) {
      this.saveAddresses(filteredAddresses);

      // If we deleted the selected address, select another one
      if (
        this.selectedAddressSubject.value.id === id &&
        filteredAddresses.length > 0
      ) {
        this.selectedAddressSubject.next(filteredAddresses[0]);
      }

      // In a real app:
      // return this.http.delete(`${this.baseUrl}/addresses/${id}`).pipe(map(() => true));
      return of(true);
    }

    return of(false);
  }
}
