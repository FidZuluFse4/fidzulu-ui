import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './component/footer/footer.component';
import {HeaderComponent} from './component/header/header.component';
import {LandingPageComponent} from './component/landing-page/landing-page.component';
import { ProductPageComponent } from './component/product-page/product-page.component';
import { AboutUsComponent } from './component/about-us/about-us.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,FooterComponent,HeaderComponent,LandingPageComponent,ProductPageComponent, AboutUsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fidzulu-ui';
}
