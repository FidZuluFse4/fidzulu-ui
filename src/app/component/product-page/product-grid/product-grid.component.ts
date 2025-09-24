import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface ProductQuantity {
  [p_id: string]: number;
}

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css'],
})
export class ProductGridComponent implements OnInit {
  @Input() products: Product[] = [];
  quantities: ProductQuantity = {};
  wishlistIds: Set<string> = new Set();

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe((user) => {
      this.wishlistIds = new Set(user.wishList.map((p: Product) => p.p_id));
    });
  }

  trackByProductId(index: number, product: Product): string {
    return product.p_id;
  }

  goToProductDetails(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  // Get current quantity or 0 if not added yet
  getQuantity(product: Product): number {
    return this.quantities[product.p_id] || 0;
  }

  // Add to cart button clicked
  addToCart(product: Product) {
    // Initialize quantity to 1
    this.quantities[product.p_id] = 1;
    this.updateCart(product);
  }

  // Increase quantity
  increaseQuantity(product: Product) {
    this.quantities[product.p_id] = (this.quantities[product.p_id] || 0) + 1;
    this.updateCart(product);
  }

  // Decrease quantity
  decreaseQuantity(product: Product) {
    if (!this.quantities[product.p_id]) return;
    this.quantities[product.p_id]--;
    this.updateCart(product);

    // If quantity is 0, remove from cart UI
    if (this.quantities[product.p_id] <= 0) {
      delete this.quantities[product.p_id];
    }
  }

  // Update cart automatically via service
  private updateCart(product: Product) {
    const quantity = this.quantities[product.p_id] || 0;
    if (quantity <= 0) return;

    this.userService.addToCart(product.p_id, quantity).subscribe({
      next: () => {
        this.snackBar.open(
          `${quantity} of ${product.p_name} added to cart`,
          'Close',
          {
            duration: 2000,
          }
        );
      },
      error: (err) => {
        console.error('Error updating cart:', err);
        this.snackBar.open('Failed to update cart. Try again.', 'Close', {
          duration: 2000,
        });
      },
    });
  }

  addToWishlist(product: Product): void {
    this.userService.addToWishlist(product.p_id).subscribe(
      () => {
        this.wishlistIds.add(product.p_id);
        this.snackBar.open(`${product.p_name} added to wishlist ❤️`, 'Close', {
          duration: 2000,
        });
      },
      (error: any) => {
        console.error('Error adding to wishlist:', error);
        this.snackBar.open(
          'Failed to add to wishlist. Please try again.',
          'Close',
          { duration: 2000 }
        );
      }
    );
  }
}
