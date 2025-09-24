import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Your custom components and services
import { Product } from '../../models/product.model';
import {
  CategoryFilters,
  ProductService,
} from '../../services/product.service';
import { SearchService } from '../../services/search.service';
// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilterSidebarComponent } from './filter-sidebar/filter-sidebar.component';
import { ProductGridComponent } from './product-grid/product-grid.component';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    FilterSidebarComponent,
    ProductGridComponent,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
})
export class ProductsPageComponent implements OnInit, OnDestroy {
  categories: string[] = ['Bike', 'Food', 'Toys', 'Books', 'DVD', 'Laptops'];
  activeProducts: Product[] | null = null;
  activeCategory: string | null = null;

  categoryFilters: CategoryFilters | null = null;
  currentFilters: any = null;
  currentSearchTerm: string = '';
  private searchSubscription!: Subscription;

  isLoading = false;
  totalProducts = 0;

  // --- THIS IS THE CHANGE ---
  // The default number of products to show per page is now 6.
  pageSize = 6;
  currentPage = 0;

  constructor(
    private productService: ProductService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchService.searchTerm$.subscribe(
      (term) => {
        this.currentSearchTerm = term;
        this.currentPage = 0;
        this.fetchProducts();
      }
    );
    // subscribe to product service loading state so the spinner reflects real HTTP activity
    this.productService.isLoading$.subscribe(
      (loading) => (this.isLoading = loading)
    );
    this.selectCategory(this.categories[0]);
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.searchService.updateSearchTerm('');
    this.selectCategory(event.tab.textLabel);
  }

  private selectCategory(categoryName: string): void {
    this.activeProducts = [];
    this.currentFilters = null;
    this.currentPage = 0;
    this.activeCategory = categoryName;

    this.productService
      .getFiltersForCategory(this.activeCategory)
      .subscribe((filters) => {
        this.categoryFilters = filters;
        this.fetchProducts();
      });
  }

  onFilterChange(filters: any): void {
    this.currentFilters = filters;
    this.currentPage = 0;
    this.fetchProducts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchProducts();
  }

  private fetchProducts(): void {
    this.productService
      .getPaginatedAndFilteredProducts(
        this.activeCategory,
        this.currentPage,
        this.pageSize,
        this.currentFilters,
        this.currentSearchTerm
      )
      .subscribe((pagedData) => {
        this.activeProducts = pagedData.products;
        this.totalProducts = pagedData.totalCount;
      });
  }
}
