import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.css'],
})
export class ProductGridComponent implements OnInit {
  @Input() products: Product[] = [];
  wishlistIds: Set<number> = new Set();

  constructor(
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.wishlistIds = new Set(user.wishList.map((p: Product) => p.p_id));
    });
  }

  trackByProductId(index: number, product: Product): number {
    return product.p_id;
  }

  goToProductDetails(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToWishlist(product: Product): void {
    this.userService.addToWishlist(product.p_id).subscribe(
      () => {
        this.wishlistIds.add(product.p_id);
        this.snackBar.open(
          `${product.p_name} added to wishlist ❤️`,
          'Close',
          { duration: 2000 }
        );
      },
      (error: any) => {
        console.error('Error adding to wishlist:', error);
        this.snackBar.open(
          'Failed to add to wishlist. Please try again.',
          'Close',
          { duration: 2000 }
        );
      }
    );
  }
}
