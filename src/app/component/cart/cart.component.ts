import { Component, OnInit } from '@angular/core';
import { Order } from '../../models/order.model';
import { OrderPage } from '../../models/order-page.model';
import { Product } from '../../models/product.model';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AddressService } from '../../services/address/address.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit {
  cart: Order[] = [];
  displayCart: OrderPage[] = [];
  products: Product[] = [];
  totalAmount = 0;
  currencySymbol: string = '$';

  constructor(
    private userService: UserService,
    private productService: ProductService,
    private router: Router,
    private addressService: AddressService
  ) {}

  ngOnInit() {
    // Load current products (for price lookups)
    this.productService.getAllProducts().subscribe((data) => {
      this.products = data;
      this.recalculateLineAmounts();
    });

    // Track currency via address
    this.addressService.getSelectedAddress().subscribe((addr) => {
      this.currencySymbol = this.locationToSymbol(addr?.location);
      this.buildDisplayCart();
    });

    // Reactive cart stream
    this.userService.cart$.subscribe((cart) => {
      this.cart = cart;
      this.recalculateLineAmounts();
      this.calculateTotal();
      this.buildDisplayCart();
    });

    // Initial sync
    this.userService.getCurrentUser().subscribe();
  }

  getProduct(p_id: string): Product | undefined {
    return this.products.find((p) => p.p_id === p_id);
  }

  calculateTotal() {
    this.totalAmount = this.cart.reduce(
      (sum, item) => sum + (item.amount || 0),
      0
    );
  }

  private recalculateLineAmounts() {
    this.cart.forEach((item) => {
      const product = this.getProduct(item.p_id);
      if (product) {
        item.amount = product.p_price * item.quantity;
      }
    });
  }

  removeFromCart(o_id: string) {
    this.userService.removeFromCart(o_id).subscribe(() => {
      this.cart = this.cart.filter((o) => o.o_id !== o_id);
      this.calculateTotal();
    });
  }

  increaseQuantity(item: OrderPage) {
    const target = this.cart.find((o) => o.o_id === item.o_id);
    if (target) {
      target.quantity++;
      const product = this.getProduct(target.p_id);
      target.amount = (product?.p_price || 0) * target.quantity;
      this.updateCart();
      this.buildDisplayCart();
    }
  }

  decreaseQuantity(item: OrderPage) {
    const target = this.cart.find((o) => o.o_id === item.o_id);
    if (target && target.quantity > 1) {
      target.quantity--;
      const product = this.getProduct(target.p_id);
      target.amount = (product?.p_price || 0) * target.quantity;
      this.updateCart();
      this.buildDisplayCart();
    }
  }

  updateCart() {
    this.userService.updateCart(this.cart).subscribe(() => {
      this.calculateTotal();
    });
  }

  gotoLanding() {
    this.router.navigate(['/landing']);
  }

  checkout() {
    this.userService.checkoutCart().subscribe(() => {
      alert('Order placed successfully!');
      this.cart = [];
      this.totalAmount = 0;
      this.buildDisplayCart();
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

  private buildDisplayCart() {
    this.displayCart = this.cart.map((o) => {
      const product = this.getProduct(o.p_id);
      return {
        ...o,
        category: product ? product.p_subtype || product.p_type : undefined,
      };
    });
  }
}
