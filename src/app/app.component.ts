import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { WishListComponent } from './routes/wish-list/wish-list.component';
import { CartComponent } from './routes/cart/cart.component';
import { AboutRouteComponent } from './routes/about-route/about-route.component';
import { ProductDetailsRouteComponent } from './routes/product-details-route/product-details-route.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoginComponent,
    WishListComponent,
    CartComponent,
    ProductDetailsRouteComponent,
    AboutRouteComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'fidzulu-ui';
}
