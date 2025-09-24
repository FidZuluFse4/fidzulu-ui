import { Component } from '@angular/core';
import { FooterComponent } from '../../component/footer/footer.component';
import { HeaderComponent } from '../../component/header/header.component';
import { ProductDetailsComponent } from '../../component/product-details/product-details.component';

@Component({
  selector: 'app-product-details-route',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ProductDetailsComponent],
  templateUrl: './product-details-route.component.html',
  styleUrl: './product-details-route.component.css',
})
export class ProductDetailsRouteComponent {}
