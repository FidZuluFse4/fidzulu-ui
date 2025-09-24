import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './component/footer/footer.component';
import { HeaderComponent } from './component/header/header.component';
import { LoginComponent } from './component/login/login.component';
import { WishListComponent } from './component/wish-list/wish-list.component';
import { CartComponent } from './component/cart/cart.component';
import { ProductPageComponent } from './component/product-page/product-page.component';
import { AboutUsComponent } from './component/about-us/about-us.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    LoginComponent,
    WishListComponent,
    CartComponent,
    ,
    ProductPageComponent,
    AboutUsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'fidzulu-ui';
}
