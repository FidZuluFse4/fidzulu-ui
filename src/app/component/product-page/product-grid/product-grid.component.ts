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
  cartIds: Set<string> = new Set();

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load wishlist from backend
    this.userService.getWishList().subscribe({
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
      }
    });

    this.userService.cart$.subscribe((cart) => {
      // derive quantities map from cart
      this.quantities = cart.reduce((acc: any, o) => {
        acc[o.p_id] = o.quantity;
        return acc;
      }, {} as ProductQuantity);
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
  // addToCart(product: Product) {
  //   this.quantities[product.p_id] = 1;
  //   this.updateCart(product);
  // }

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
    this.userService.addToCart(product.p_id, quantity).subscribe();
  }

  addToWishlist(product: Product): void {
    this.userService.addToWishlist(product.p_id).subscribe({
      next: (res: any) => {
        // After adding, fetch updated wishlist
        this.userService.getWishList().subscribe({
          next: (list: any) => {
            if (Array.isArray(list)) {
              this.wishlistIds = new Set(list.map((p: any) => p.p_id));
            } else if (list && list.wishlist && Array.isArray(list.wishlist)) {
              this.wishlistIds = new Set(list.wishlist.map((p: any) => p.p_id));
            }
          }
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

  addToCart(product: Product): void {
  this.userService.addToCart(product.p_id, 1).subscribe({
    next: (res: any) => {
      // After adding, fetch updated cart
      this.userService.getCart().subscribe({
        next: (cart: any) => {
          if (Array.isArray(cart)) {
            this.cartIds = new Set(cart.map((p: any) => p.p_id));
          } else if (cart && cart.items && Array.isArray(cart.items)) {
            this.cartIds = new Set(cart.items.map((p: any) => p.p_id));
          }
        }
      });
      this.snackBar.open(
        `${product.p_name} added to cart 🛒`,
        'Close',
        { duration: 2000 }
      );
    },
    error: (error) => {
      console.error('Error adding to cart:', error);
      this.snackBar.open('Cart update failed', 'Close', {
        duration: 2000,
      });
    },
  });
}

}
