import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { WishListComponent } from './routes/wish-list/wish-list.component';
import { CartComponent } from './routes/cart/cart.component';
import { AboutRouteComponent } from './routes/about-route/about-route.component';
import { ProductDetailsRouteComponent } from './routes/product-details-route/product-details-route.component';
import { filter } from 'rxjs/operators';

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
export class AppComponent implements OnInit {
  title = 'fidzulu-ui';

  constructor(private router: Router) {}

  ngOnInit() {
    // Scroll to top when navigating to a new route
    this.router.events
      .pipe(
        // Filter to only get NavigationEnd events
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }
}
