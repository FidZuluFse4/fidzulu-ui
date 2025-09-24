import { Component, OnInit } from '@angular/core';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule,MatButtonModule,MatCardModule,MatIconModule,MatDividerModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cart: Order[] = [];
  products: Product[] = [];
  totalAmount = 0;

  constructor(private userService: UserService, private productService: ProductService) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.cart = user.cart;
      this.calculateTotal();
    });

    this.productService.getAllProducts().subscribe(data => {
      this.products = data;
    });
  }

  getProduct(p_id: number): Product | undefined {
    return this.products.find(p => p.p_id === p_id);
  }

  calculateTotal() {
    this.totalAmount = this.cart.reduce((sum, item) => sum + item.amount, 0);
  }

  removeFromCart(o_id: number) {
    this.userService.removeFromCart(o_id).subscribe(() => {
      this.cart = this.cart.filter(o => o.o_id !== o_id);
      this.calculateTotal();
    });
  }

  increaseQuantity(item: Order) {
  item.quantity++;
  item.amount = item.quantity * (this.getProduct(item.p_id)?.p_price || 0);
  this.updateCart();
  }

  decreaseQuantity(item: Order) {
    if (item.quantity > 1) {
      item.quantity--;
      item.amount = item.quantity * (this.getProduct(item.p_id)?.p_price || 0);
      this.updateCart();
    }
  }

  updateCart() {
    this.userService.updateCart(this.cart).subscribe(() => {
      this.calculateTotal();
    });
  }

  checkout() {
    this.userService.checkoutCart().subscribe(() => {
      alert('Order placed successfully!');
      this.cart = [];
      this.totalAmount = 0;
    });
  }
}

