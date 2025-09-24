import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable } from 'rxjs';

// --- INTERFACES ---
export interface PagedProducts {
  products: Product[];
  totalCount: number;
}

export interface CategoryFilters {
  attributes: Map<string, Set<string>>;
  minPrice: number;
  maxPrice: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'assets/products.json';
  private allProductsCache: Product[] | null = null;
  private baseUrl = 'http://localhost:3000';

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }
  constructor(private http: HttpClient) {}

  private fetchAndCacheProducts(): Observable<Product[]> {
    if (this.allProductsCache) {
      return of(this.allProductsCache);
    }
    return this.http.get<Product[]>(this.productsUrl).pipe(
      map((products) => {
        this.allProductsCache = products;
        return products;
      })
    );
  }

  getPaginatedAndFilteredProducts(
    category: string | null,
    pageIndex: number,
    pageSize: number,
    filters: any,
    searchTerm: string | null
  ): Observable<PagedProducts> {
    return this.fetchAndCacheProducts().pipe(
      map((products) => {
        let filteredProducts = products;

        // Step 1: Filter by category FIRST (if one is selected)
        if (category) {
          filteredProducts = filteredProducts.filter(
            (p) => p.p_type === category
          );
        }

        // Step 2: Then, filter the result by the search term
        if (searchTerm) {
          const lowerCaseSearchTerm = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter(
            (p) =>
              p.p_name.toLowerCase().includes(lowerCaseSearchTerm) ||
              p.p_desc.toLowerCase().includes(lowerCaseSearchTerm) ||
              p.p_subtype.toLowerCase().includes(lowerCaseSearchTerm)
          );
        }

        // Step 3: Then, apply the sidebar filters
        if (filters) {
          if (filters.price) {
            filteredProducts = filteredProducts.filter(
              (p) => p.p_price <= filters.price
            );
          }
          const activeAttributeFilters = new Map<string, string[]>();
          for (const key in filters) {
            if (key !== 'price' && filters[key] === true) {
              const [group, value] = key.split('_');
              if (!activeAttributeFilters.has(group))
                activeAttributeFilters.set(group, []);
              activeAttributeFilters.get(group)?.push(value);
            }
          }
          if (activeAttributeFilters.size > 0) {
            filteredProducts = filteredProducts.filter((product) => {
              return Array.from(activeAttributeFilters.entries()).every(
                ([group, values]) => {
                  if (group === 'Brand')
                    return values.includes(product.p_subtype);
                  if (product.attribute && product.attribute[group])
                    return values.includes(product.attribute[group]);
                  return false;
                }
              );
            });
          }
        }

        // Final Steps: Get total count and apply pagination
        const totalCount = filteredProducts.length;
        const startIndex = pageIndex * pageSize;
        const pagedProducts = filteredProducts.slice(
          startIndex,
          startIndex + pageSize
        );

        return { products: pagedProducts, totalCount: totalCount };
      })
    );
  }

  getFiltersForCategory(category: string): Observable<CategoryFilters> {
    return this.fetchAndCacheProducts().pipe(
      map((products) => {
        const categoryProducts = products.filter((p) => p.p_type === category);
        if (categoryProducts.length === 0)
          return { attributes: new Map(), minPrice: 0, maxPrice: 1000 };
        const prices = categoryProducts.map((p) => p.p_price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const attributes = new Map<string, Set<string>>();
        categoryProducts.forEach((product) => {
          if (product.p_subtype) {
            if (!attributes.has('Brand'))
              attributes.set('Brand', new Set<string>());
            attributes.get('Brand')?.add(product.p_subtype);
          }
          for (const key in product.attribute) {
            if (!attributes.has(key)) attributes.set(key, new Set<string>());
            attributes.get(key)?.add(product.attribute[key]);
          }
        });
        return { attributes, minPrice, maxPrice };
      })
    );
  }
}
