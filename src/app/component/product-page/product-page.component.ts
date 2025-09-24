import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';

import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { Product } from '../../models/product.model';
import { Order } from '../../models/order.model';

interface ProductImage {
  src: string;
  alt?: string;
}

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule,
    HttpClientModule // <-- Required for HttpClient in ProductService
  ],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProductPageComponent implements OnInit {
  product?: Product;
  images: ProductImage[] = [];
  selectedIndex = 0;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productService.getProductById(1).subscribe(p => {
      this.product = p;
      if (p?.attribute && p.attribute['images']) {
        this.images = p.attribute['images']
          .split(',')
          .map((url, i) => ({ src: url.trim(), alt: `${p.p_name} - ${i + 1}` }));
      } else if (p) {
        this.images = [{ src: p.p_img_url, alt: p.p_name }];
      }
    });
  }

  get selected() { return this.images[this.selectedIndex]; }
  select(index: number) { this.selectedIndex = index; }
  prev() { this.selectedIndex = (this.selectedIndex - 1 + this.images.length) % this.images.length; }
  next() { this.selectedIndex = (this.selectedIndex + 1) % this.images.length; }
  increase() { if (this.product) this.product.p_quantity++; }
  decrease() { if (this.product && this.product.p_quantity > 1) this.product.p_quantity--; }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') this.prev();
    if (e.key === 'ArrowRight') this.next();
  }

  addToCart() {
    if (!this.product) return;

    const user = this.userService.getCurrentUser();
    const newOrder: Order = {
      o_id: Date.now(),
      p_id: this.product.p_id,
      user_id: 1,
      quantity: this.product.p_quantity,
      amount: this.product.p_quantity * this.product.p_price
    };

    const existing = user.cart.find(o => o.p_id === this.product!.p_id);
    if (existing) {
      existing.quantity += this.product.p_quantity;
      existing.amount = existing.quantity * this.product.p_price;
    } else {
      user.cart.push(newOrder);
    }

    this.userService.updateUserCart(user.cart);
    this.snackBar.open(`${this.product.p_quantity} of ${this.product.p_name} added to cart`, 'Close', { duration: 2000 });
  }

  isInWishlist(): boolean {
    if (!this.product) return false;
    const user = this.userService.getCurrentUser();
    return user.wishList.some(p => p.p_id === this.product!.p_id);
  }

  addToWishlist() {
    if (!this.product) return;

    const user = this.userService.getCurrentUser();
    const exists = user.wishList.find(p => p.p_id === this.product!.p_id);

    if (!exists) {
      user.wishList.push(this.product);
      this.userService.setCurrentUser(user);
      this.snackBar.open(`${this.product.p_name} added to wishlist ❤️`, 'Close', { duration: 2000 });
    } else {
      user.wishList = user.wishList.filter(p => p.p_id !== this.product!.p_id);
      this.userService.setCurrentUser(user);
      this.snackBar.open(`${this.product.p_name} removed from wishlist ❌`, 'Close', { duration: 2000 });
    }
  }
}
