import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { Address } from '../../models/address.model';
import { AddressDialogComponent } from '../address-dialog/address-dialog.component';
import { AddressService } from '../../services/address/address.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  searchControl = new FormControl('');
  isSearchVisible = false;
  isMobile = false;

  addresses: Address[] = [];
  selectedAddress!: Address;
  cartCount = 0;
  currencySymbol: string = '$';

  // Detect screen size changes
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  constructor(
    private searchService: SearchService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog,
    private addressService: AddressService,
    private userService: UserService
  ) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    // This is the best practice for real-time search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait for 300ms after the user stops typing
        distinctUntilChanged() // Only emit if the value has actually changed
      )
      .subscribe((term) => {
        // The term will be null if the input is empty
        this.searchService.updateSearchTerm(term || '');
      });

    // Load addresses from service
    this.addressService.getAddresses().subscribe((addresses) => {
      this.addresses = addresses;
    });

    // Get the selected address
    this.addressService.getSelectedAddress().subscribe((address) => {
      this.selectedAddress = address;
      this.currencySymbol = this.locationToSymbol(address?.location);
    });

    this.userService.cart$.subscribe((cart) => {
      const total = cart.reduce((sum, o) => sum + o.quantity, 0);
      this.cartCount = total > 9 ? 9 : total; // keep 0-9 (show 9+ if >9)
    });
  }

  // This function can be removed or kept for the mobile search button
  onSearch(): void {
    this.searchService.updateSearchTerm(this.searchControl.value || '');
    if (window.innerWidth < 768) {
      this.isSearchVisible = false;
    }
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }
  logOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  goToCart() {
    this.router.navigate(['/cart']);
  }

  get cartDisplay(): string {
    const total =
      this.userService['cartSubject']?.value?.reduce(
        (s: number, o: any) => s + o.quantity,
        0
      ) || 0;
    if (total === 0) return '';
    if (total > 9) return '9+';
    return String(total);
  }
  goToWishlist() {
    this.router.navigate(['/wishlist']);
  }
  goToHome() {
    this.router.navigate(['/landing']);
  }

  openAddressDialog(): void {
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      width: window.innerWidth <= 600 ? '95%' : '500px',
      maxWidth: '95vw',
      data: {
        addresses: this.addresses,
        selectedAddress: this.selectedAddress,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the selected address in the service
        this.addressService.setSelectedAddress(result);
      }
    });
  }

  private locationToSymbol(location?: string): string {
    if (!location) return '$';
    const l = location.toLowerCase();
    if (l.includes('india') || l === 'in') return '₹';
    if (l.includes('ireland') || l === 'ir') return '€';
    if (
      l.includes('usa') ||
      l.includes('united') ||
      l.includes('america') ||
      l === 'us'
    )
      return '$';
    return '$';
  }
}
