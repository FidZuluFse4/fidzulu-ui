import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderHistoryService } from '../../services/order-history.service';
import { ProductService } from '../../services/product.service';
import { Orders } from '../../models/orders.model';
import { Order } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { forkJoin, of, catchError, map } from 'rxjs';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent implements OnInit {
  orders: Orders[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  expandedOrderId: string | null = null;
  productDetails: Map<string, Product> = new Map();
  productLoadingStates: Map<string, boolean> = new Map();
  productLoadingErrors: Map<string, string> = new Map();
  defaultImageUrl: string = 'assets/logo.PNG'; // Default image if product image is not available

  constructor(
    private orderHistoryService: OrderHistoryService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrderHistory();
  }

  loadOrderHistory(): void {
    this.isLoading = true;
    this.error = null;

    this.orderHistoryService.getOrderHistory().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.isLoading = false;
      },
    });
  }

  // Toggle expanded state for an order
  toggleOrderDetails(orderId: string): void {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
    } else {
      this.expandedOrderId = orderId;
      
      // Load product details when expanding an order
      const order = this.orders.find(o => o.orders_id === orderId);
      if (order) {
        this.loadProductDetailsForOrder(order);
      }
    }
  }
  
  // Load product details for an entire order
  loadProductDetailsForOrder(order: Orders): void {
    order.order_list.forEach(item => {
      if (!this.productDetails.has(item.p_id)) {
        this.loadProductDetails(item.p_id);
      }
    });
  }
  
  // Load details for a specific product
  loadProductDetails(productId: string): void {
    // Set loading state
    this.productLoadingStates.set(productId, true);
    this.productLoadingErrors.delete(productId);
    
    this.productService.getProductById(productId).pipe(
      catchError(error => {
        console.error(`Error loading product ${productId}:`, error);
        this.productLoadingErrors.set(productId, 'Could not load product details');
        this.productLoadingStates.set(productId, false);
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        this.productDetails.set(productId, product);
      }
      this.productLoadingStates.set(productId, false);
    });
  }
  
  // Get product details if available
  getProductDetails(productId: string): Product | undefined {
    return this.productDetails.get(productId);
  }
  
  // Check if product is loading
  isProductLoading(productId: string): boolean {
    return this.productLoadingStates.get(productId) || false;
  }
  
  // Check if product has loading error
  hasProductError(productId: string): boolean {
    return this.productLoadingErrors.has(productId);
  }

  // Navigate to product details page
  viewProductDetails(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  // Calculate total items in an order
  getTotalItems(order: Orders): number {
    return order.order_list.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Format date string (if your API returns dates)
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Navigate to home page
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
  
  // Handle image loading errors
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = this.defaultImageUrl;
    }
  }
}
