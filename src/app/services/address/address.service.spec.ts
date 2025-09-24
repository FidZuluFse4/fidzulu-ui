import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AddressService } from './address.service';
import { firstValueFrom } from 'rxjs';

describe('AddressService', () => {
  let service: AddressService;

  beforeEach(() => {
    // Clear localStorage to have deterministic tests
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService],
    });
    service = TestBed.inject(AddressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default addresses and selected', async () => {
    const addresses = await firstValueFrom(service.getAddresses());
    expect(addresses.length).toBeGreaterThan(0);
    const selected = await firstValueFrom(service.getSelectedAddress());
    expect(selected.isDefault).toBeTrue();
  });

  it('should add an address and persist selection change', async () => {
    const newAddr = {
      id: '',
      location: 'France',
      full_addr: 'Paris',
      isDefault: false,
    };
    await firstValueFrom(service.addAddress(newAddr as any));
    const addresses = await firstValueFrom(service.getAddresses());
    const added = addresses.find((a) => a.location === 'France');
    expect(added).toBeTruthy();
    service.setSelectedAddress(added!);
    const selected = await firstValueFrom(service.getSelectedAddress());
    expect(selected.location).toBe('France');
  });

  it('should update an address', async () => {
    const addresses = await firstValueFrom(service.getAddresses());
    const first = { ...addresses[0], full_addr: 'Updated Addr' };
    await firstValueFrom(service.updateAddress(first));
    const updatedList = await firstValueFrom(service.getAddresses());
    expect(updatedList[0].full_addr).toBe('Updated Addr');
  });

  it('should delete an address and reselect first when needed', async () => {
    const addresses = await firstValueFrom(service.getAddresses());
    if (addresses.length < 2) {
      // add second to test deletion
      await firstValueFrom(
        service.addAddress({
          id: '',
          location: 'Temp',
          full_addr: 'Temp',
          isDefault: false,
        } as any)
      );
    }
    const all = await firstValueFrom(service.getAddresses());
    const toDelete = all[0];
    await firstValueFrom(service.deleteAddress(toDelete.id!));
    const remaining = await firstValueFrom(service.getAddresses());
    expect(remaining.find((a) => a.id === toDelete.id)).toBeFalsy();
  });
});
