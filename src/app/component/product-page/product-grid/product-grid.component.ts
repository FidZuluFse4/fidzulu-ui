import { Component, Input } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-grid.component.html',
  styleUrl: './product-grid.component.css',
})
export class ProductGridComponent {
  // @Input() is how the parent component sends data to this child.
  @Input() products: Product[] = [];

  constructor(private router: Router) {}

  // This is a performance best practice for ngFor loops.
  trackByProductId(index: number, product: Product): number {
    return product.p_id;
  }

  // Navigate to product details page
  goToProductDetails(productId: number): void {
    this.router.navigate(['/product', productId]);
  }
}
