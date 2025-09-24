import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { WishListComponent } from './routes/wish-list/wish-list.component';
import { LandingComponent } from './routes/landing/landing.component';
import { CartComponent } from './routes/cart/cart.component';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: LoginComponent },
  { path: 'cart', component: CartComponent },
  { path: 'wishlist', component: WishListComponent },
];
