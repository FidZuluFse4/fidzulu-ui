import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSnackBarModule,
  ],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.css',
})
export class WishListComponent implements OnInit {
  wishlist: Product[] = [];
  // pagination
  pageSize = 6;
  pageIndex = 0;

  // quantities map: product id -> quantity
  quantities: { [p_id: string]: number } = {};

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  goToProductDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  ngOnInit() {
    this.userService.getCurrentUser().subscribe((user) => {
      this.wishlist = user.wishList;
    });
  }

  // when user clicks initial Add to Cart, set counter to 1 and update backend
  addToCart(product: Product) {
    this.quantities[product.p_id] = 1;
    this.updateCart(product);
  }

  increaseQuantity(product: Product) {
    this.quantities[product.p_id] = (this.quantities[product.p_id] || 0) + 1;
    this.updateCart(product);
  }

  decreaseQuantity(product: Product) {
    if (!this.quantities[product.p_id]) return;
    this.quantities[product.p_id]--;
    // if quantity drops to 0, remove the counter from UI
    if (this.quantities[product.p_id] <= 0) {
      delete this.quantities[product.p_id];
      // do not call backend for zero quantity to avoid accidental removals
      return;
    }
    this.updateCart(product);
  }

  removeFromWishlist(p_id: string) {
    this.userService.removeFromWishlist(p_id).subscribe(() => {
      this.wishlist = this.wishlist.filter((p) => p.p_id !== p_id);
    });
  }

  // Paginator event
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    // pageSize is fixed to 6 but respect any incoming change
    this.pageSize = event.pageSize;
  }

  // returns current page items
  get pagedWishlist(): Product[] {
    const start = this.pageIndex * this.pageSize;
    return this.wishlist.slice(start, start + this.pageSize);
  }

  private updateCart(product: Product) {
    const quantity = this.quantities[product.p_id] || 0;
    if (quantity <= 0) return;

    this.userService.addToCart(product.p_id, quantity).subscribe({
      next: () => {
        // intentionally no alert/snackbar on success (user requested no alerts)
      },
      error: (err) => {
        console.error('Error updating cart:', err);
        // show error snackbar so user knows something went wrong
        this.snackBar.open('Failed to update cart. Try again.', 'Close', {
          duration: 2500,
        });
      },
    });
  }

  gotoLanding() {
    this.router.navigate(['/landing']);
  }
}
