import { Routes } from '@angular/router';
import { CartComponent } from './component/cart/cart.component';
import { WishListComponent } from './component/wish-list/wish-list.component';
import { LandingPageComponent } from './component/landing-page/landing-page.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'cart', component: CartComponent },
    { path: 'wishlist', component: WishListComponent }
];
