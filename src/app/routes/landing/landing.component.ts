import { Component } from '@angular/core';
import { HeaderComponent } from '../../component/header/header.component';
import { FooterComponent } from '../../component/footer/footer.component';
import { ProductsPageComponent } from '../../component/product-page/product-page.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ProductsPageComponent, HeaderComponent, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {}
