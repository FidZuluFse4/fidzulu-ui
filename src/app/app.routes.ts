import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { ProductsPageComponent } from './component/product-page/product-page.component';
import { CartComponent } from './component/cart/cart.component';
import { WishListComponent } from './component/wish-list/wish-list.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';

export const routes: Routes = [
  { path: 'landing', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: LandingPageComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishListComponent },
];
