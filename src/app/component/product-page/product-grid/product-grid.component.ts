import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs/operators';

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
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css'],
})
export class ProductGridComponent implements OnInit {
  @Input() products: Product[] = [];
  quantities: ProductQuantity = {};
  wishlistIds: Set<string> = new Set();

  // Loading states
  isLoading = true; // Overall loading state for initial data fetch
  isWishlistLoading: { [p_id: string]: boolean } = {};
  isCartLoading: { [p_id: string]: boolean } = {};

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Set loading state at start
    this.isLoading = true;

    // Load wishlist from backend
    this.userService
      .getWishList()
      .pipe(
        finalize(() => {
          // If products are already loaded, we can finish loading
          if (this.products && this.products.length > 0) {
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        next: (list: any) => {
          // If backend returns array of products, update wishlistIds
          if (Array.isArray(list)) {
            this.wishlistIds = new Set(list.map((p: any) => p.p_id));
          } else if (list && list.wishlist && Array.isArray(list.wishlist)) {
            this.wishlistIds = new Set(list.wishlist.map((p: any) => p.p_id));
          }
        },
        error: () => {
          this.wishlistIds = new Set();
        },
      });

    this.userService.cart$.subscribe((cart) => {
      // derive quantities map from cart
      this.quantities = cart.reduce((acc: any, o) => {
        acc[o.p_id] = o.quantity;
        return acc;
      }, {} as ProductQuantity);

      // After cart is loaded, we can consider the loading complete
      if (!this.isLoading && this.products && this.products.length > 0) {
        this.isLoading = false;
      }
    });

    // If we already have products at this point, loading is finished
    if (this.products && this.products.length > 0) {
      this.isLoading = false;
    }
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
    this.isCartLoading[product.p_id] = true;
    this.quantities[product.p_id] = 1;
    this.updateCart(product);
  }

  // Increase quantity
  increaseQuantity(product: Product) {
    this.isCartLoading[product.p_id] = true;
    this.quantities[product.p_id] = (this.quantities[product.p_id] || 0) + 1;
    this.updateCart(product);
  }

  // Decrease quantity
  decreaseQuantity(product: Product) {
    if (!this.quantities[product.p_id]) return;

    this.isCartLoading[product.p_id] = true;
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
    if (quantity <= 0) {
      this.isCartLoading[product.p_id] = false;
      return;
    }

    this.userService
      .addToCart(product.p_id, quantity)
      .pipe(
        finalize(() => {
          this.isCartLoading[product.p_id] = false;
        })
      )
      .subscribe({
        error: (error) => {
          console.error('Error updating cart:', error);
          this.snackBar.open('Failed to update cart', 'Close', {
            duration: 2000,
          });
        },
      });
  }

  addToWishlist(product: Product): void {
    // Set loading state for this specific product's wishlist action
    this.isWishlistLoading[product.p_id] = true;

    this.userService
      .addToWishlist(product.p_id)
      .pipe(
        finalize(() => {
          this.isWishlistLoading[product.p_id] = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          // After adding, fetch updated wishlist
          this.userService.getWishList().subscribe({
            next: (list: any) => {
              if (Array.isArray(list)) {
                this.wishlistIds = new Set(list.map((p: any) => p.p_id));
              } else if (
                list &&
                list.wishlist &&
                Array.isArray(list.wishlist)
              ) {
                this.wishlistIds = new Set(
                  list.wishlist.map((p: any) => p.p_id)
                );
              }
            },
          });
          this.snackBar.open(
            `${product.p_name} added to wishlist ❤️`,
            'Close',
            { duration: 2000 }
          );
        },
        error: (error) => {
          console.error('Error adding to wishlist:', error);
          this.snackBar.open('Wishlist update failed', 'Close', {
            duration: 2000,
          });
        },
      });
  }
}
