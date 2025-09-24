import { Component } from '@angular/core';
import { FooterComponent } from '../../component/footer/footer.component';
import { HeaderComponent } from '../../component/header/header.component';
import { CartComponent as CartItemComponent } from '../../component/cart/cart.component';
@Component({
  selector: 'app-cart-route',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CartItemComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {}
