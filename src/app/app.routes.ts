import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { WishListComponent } from './routes/wish-list/wish-list.component';
import { LandingComponent } from './routes/landing/landing.component';
import { CartComponent } from './routes/cart/cart.component';
import { AboutRouteComponent } from './routes/about-route/about-route.component';
import { ProductDetailsRouteComponent } from './routes/product-details-route/product-details-route.component';
import { authGuard } from './services/auth.guard';
import { noAuthGuard } from './services/no-auth.guard';

export const routes: Routes = [
  { path: 'landing', component: LandingComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: '', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'wishlist', component: WishListComponent, canActivate: [authGuard] },
  { path: 'product/:id', component: ProductDetailsRouteComponent },
  { path: 'about', component: AboutRouteComponent },
];
