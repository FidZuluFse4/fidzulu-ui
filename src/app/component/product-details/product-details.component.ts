import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';

interface ProductImage {
  src: string;
  alt?: string;
}

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule,
    HttpClientModule,
    RouterModule,
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductDetailsComponent implements OnInit {
  product?: Product;
  images: ProductImage[] = [];
  selectedIndex = 0;

  // quantity state: undefined => not added, 0 => removed, >0 => added
  productQuantity?: number;
  isInWishlistFlag = false;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const id = +params['id'];
          if (isNaN(id)) {
            this.router.navigate(['/products']);
            return of(null);
          }
          return this.productService.getProductById(id);
        }),
        catchError((err) => {
          console.error('Error loading product:', err);
          this.snackBar.open('Product not found!', 'Close', { duration: 3000 });
          this.router.navigate(['/products']);
          return of(null);
        })
      )
      .subscribe((product) => {
        if (!product) return;

        this.product = product;

        // Handle product images
        if (product.attribute && product.attribute['images']) {
          this.images = product.attribute['images']
            .split(',')
            .map((url, i) => ({
              src: url.trim(),
              alt: `${product.p_name} - ${i + 1}`,
            }));
        } else {
          this.images = [{ src: product.p_img_url, alt: product.p_name }];
        }

        // Check if product is in wishlist
        this.checkWishlistStatus();

        // Check if already in cart
        this.userService.getCurrentUser().subscribe((user) => {
          const order = user.cart.find((o) => o.p_id === this.product?.p_id);
          if (order) {
            this.productQuantity = order.quantity;
          } else {
            this.productQuantity = undefined;
          }
        });
      });
  }

  private checkWishlistStatus(): void {
    if (!this.product) return;
    this.userService.getCurrentUser().subscribe((user) => {
      this.isInWishlistFlag = user.wishList.some(
        (item: Product) => item.p_id === this.product?.p_id
      );
    });
  }

  get selected() {
    return this.images[this.selectedIndex];
  }

  select(index: number) {
    this.selectedIndex = index;
  }

  prev() {
    this.selectedIndex =
      (this.selectedIndex - 1 + this.images.length) % this.images.length;
  }

  next() {
    this.selectedIndex = (this.selectedIndex + 1) % this.images.length;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  addToCart() {
    if (!this.product) return;

    this.productQuantity = 1; // initial quantity
    this.updateCart();
    this.snackBar.open(
      `${this.productQuantity} of ${this.product?.p_name} added to cart`,
      'Close',
      { duration: 2000 }
    );
  }

  increase() {
    if (!this.product || this.productQuantity === undefined) return;

    this.productQuantity++;
    this.updateCart();
  }

  decrease() {
    if (!this.product || this.productQuantity === undefined) return;

    this.productQuantity--;
    if (this.productQuantity <= 0) {
      // remove from cart and reset
      this.userService.removeFromCart(this.product.p_id).subscribe(() => {
        this.productQuantity = undefined;
        this.snackBar.open(`${this.product?.p_name} removed from cart`, 'Close', {
          duration: 2000,
        });
      });
    } else {
      this.updateCart();
    }
  }

  private updateCart() {
    if (!this.product || this.productQuantity === undefined) return;

    this.userService
      .addToCart(this.product.p_id, this.productQuantity)
      .subscribe(() => {});
  }

  isInWishlist(): boolean {
    return this.isInWishlistFlag;
  }

  addToWishlist() {
    if (!this.product) return;

    if (!this.isInWishlistFlag) {
      this.userService.addToWishlist(this.product.p_id).subscribe(() => {
        this.isInWishlistFlag = true;
        this.snackBar.open(`${this.product?.p_name} added to wishlist ❤️`, 'Close', {
          duration: 2000,
        });
      });
    } else {
      this.userService.removeFromWishlist(this.product.p_id).subscribe(() => {
        this.isInWishlistFlag = false;
        this.snackBar.open(`${this.product?.p_name} removed from wishlist ❌`, 'Close', {
          duration: 2000,
        });
      });
    }
  }
}
