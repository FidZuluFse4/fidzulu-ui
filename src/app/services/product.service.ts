import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import {
  map,
  switchMap,
  tap,
  filter,
  finalize,
  catchError,
  distinctUntilChanged,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AddressService } from './address/address.service';
import { Team } from '../models/team.model';

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
  /**
   * Emits the current product list for the active selected address.
   * This is updated whenever the AddressService emits a new selected address.
   */
  // Start with null so consumers can wait until the first real payload arrives
  private productsSubject = new BehaviorSubject<Product[] | null>(null);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public readonly isLoading$ = this.isLoadingSubject.asObservable();
  private addressListenerStarted = false;
  // Derived dynamically from environment.bikeUrl (which currently points at essentials/bikes)
  private essentialsRoot: string;
  private mediatronicsRoot: string;

  // Active category subject (default Bike)
  private activeCategorySubject = new BehaviorSubject<string>('Bike');
  public readonly activeCategory$ = this.activeCategorySubject
    .asObservable()
    .pipe(distinctUntilChanged());

  // Category -> group + path segment mapping
  private categoryConfig: Record<
    string,
    { group: 'essentials' | 'mediatronics'; path: string }
  > = {
    Bike: { group: 'essentials', path: 'bikes' },
    Food: { group: 'essentials', path: 'food' },
    Toys: { group: 'essentials', path: 'toys' },
    Books: { group: 'mediatronics', path: 'books' },
    DVD: { group: 'mediatronics', path: 'dvds/all' },
    Laptops: { group: 'mediatronics', path: 'laptops/all' },
  };
  // Separator used by filter sidebar to build control names
  private readonly FILTER_CONTROL_SEP = '___SEP___';

  constructor(
    private http: HttpClient,
    private addressService: AddressService
  ) {
    // essentialsBase now: .../essentials
    this.essentialsRoot = environment.lambda_essentials;
    this.mediatronicsRoot = environment.lambda_mediatronics;
  }

  // Start listening to selected address changes and fetch products accordingly
  private startAddressListener(): void {
    if (this.addressListenerStarted) return;
    this.addressListenerStarted = true;

    combineLatest([
      this.addressService.getSelectedAddress(),
      this.activeCategory$,
    ])
      .pipe(
        switchMap(([address, category]) => {
          const code = this.mapLocationToCode(address?.location);
          const { url } = this.buildCategoryUrls(category, code);
          console.debug('[ProductService] fetching products for', {
            location: address?.location,
            code,
            category,
            url,
          });
          this.isLoadingSubject.next(true);
          return this.http.get<any>(url).pipe(
            map((resp) => this.extractArrayPayload(resp)),
            finalize(() => this.isLoadingSubject.next(false)),
            catchError((err) => {
              console.error('[ProductService] fetch error', err);
              return of([]);
            })
          );
        }),
        map((rawProducts: any[]) => this.normalizeProducts(rawProducts))
      )
      .subscribe({
        next: (products) => {
          console.debug('[ProductService] normalized products:', products);
          this.productsSubject.next(products);
        },
        error: (err) => {
          console.error('Error in product stream', err);
          this.productsSubject.next([]);
          this.isLoadingSubject.next(false);
        },
      });
  }

  /**
   * Gets all products from the local assets folder
   * @returns Observable with all products
   */
  getAllProducts(): Observable<Product[]> {
    // Ensure the address listener is started and return the live products stream
    this.startAddressListener();
    return this.productsSubject
      .asObservable()
      .pipe(filter((p): p is Product[] => p !== null));
  }

  /**
   * Gets a specific product by ID from the local assets folder
   * @param id The product ID to retrieve
   * @returns Observable with the requested product
   */
  getProductById(id: string): Observable<Product> {
    this.startAddressListener();
    return this.productsSubject.asObservable().pipe(
      filter((p): p is Product[] => p !== null),
      map((products) => {
        const product = products.find((p) => p.p_id === id);
        if (!product) {
          throw new Error(`Product with id ${id} not found`);
        }
        return product;
      })
    );
  }

  /**
   * Fetches and caches products either from the local cache or from the assets JSON file
   * @returns Observable with all products
   */
  // removed fetchAndCacheProducts; products come from productsSubject updated on address changes

  /**
   * Map human-readable location to the short code expected by the backend.
   * Examples: 'India' -> 'IN', 'Ireland' -> 'IR', 'USA' / 'United States' -> 'US'
   */
  private mapLocationToCode(location?: string): string {
    if (!location) return 'US-NC';
    const l = location.toLowerCase();
    if (l.includes('india') || l === 'in') return 'IN';
    if (l.includes('ireland') || l === 'ir') return 'IR';
    if (
      l.includes('USA') ||
      l.includes('united') ||
      l.includes('america') ||
      l === 'us'
    )
      return 'US-NC';
    // Default to US if unknown
    return 'US-NC';
  }

  /** Set the active product category (called by UI) */
  setActiveCategory(category: string): void {
    if (!category) return;
    this.activeCategorySubject.next(category);
  }

  getActiveCategory(): string {
    return this.activeCategorySubject.value;
  }

  /** Build product & team URLs for a category and location code */
  private buildCategoryUrls(
    category: string,
    locationCode: string
  ): { url: string; teamUrl: string } {
    const cfg = this.categoryConfig[category] || this.categoryConfig['Bike'];
    const root =
      cfg.group === 'essentials' ? this.essentialsRoot : this.mediatronicsRoot;
    const productUrl = `${root}/${cfg.path}/${locationCode}`;
    const teamUrl = `${root}/${cfg.path}/team`;
    return { url: productUrl, teamUrl };
  }

  /** Extract an array from various backend envelope shapes */
  private extractArrayPayload(resp: any): any[] {
    if (Array.isArray(resp)) return resp;
    if (resp && Array.isArray(resp.products)) return resp.products;
    if (resp && Array.isArray(resp.data)) return resp.data;
    if (resp && Array.isArray(resp.items)) return resp.items;
    if (resp && typeof resp === 'object') {
      const found = Object.values(resp).find((v) => Array.isArray(v));
      if (found) return found as any[];
    }
    console.warn(
      '[ProductService] unexpected response shape, returning empty array'
    );
    return [];
  }

  /** Normalize raw products into Product interface */
  private normalizeProducts(rawProducts: any[]): Product[] {
    return (rawProducts || []).map((rp: any) => {
      const normalized: Product = {
        p_id: rp.p_id ?? rp.id,
        p_type: rp.p_type ?? rp.pType ?? rp.type ?? 'Unknown',
        p_subtype: rp.p_subtype ?? rp.p_sub_type ?? rp.pSubType ?? undefined,
        p_name: rp.p_name ?? rp.name ?? 'Unnamed',
        p_desc: rp.p_desc ?? rp.description ?? '',
        p_currency: rp.p_currency ?? rp.currency ?? undefined,
        p_price: Number(rp.p_price) || 0,
        p_img_url: Array.isArray(rp.p_img_url) ? rp.p_img_url[0] : rp.p_img_url,
        attribute: rp.attribute ?? rp.attributes ?? {},
        p_quantity: rp.p_quantity ?? rp.quantity ?? 0,
      } as Product;
      if (!normalized.p_subtype && rp.p_sub_type)
        normalized.p_subtype = rp.p_sub_type;
      return normalized;
    });
  }

  /** Fetch teams for a given category (or active) */
  getTeamsForCategory(category?: string): Observable<Team[]> {
    const cat = category || this.getActiveCategory();
    const { teamUrl } = this.buildCategoryUrls(cat, 'NA'); // location code not required per spec for team endpoint
    return this.http.get<any>(teamUrl).pipe(
      map((resp) => this.extractArrayPayload(resp) as Team[]),
      catchError((err) => {
        console.error('[ProductService] team fetch failed', err);
        return of([] as Team[]);
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
    this.startAddressListener();
    return this.productsSubject.asObservable().pipe(
      filter((p): p is Product[] => p !== null),
      map((products: Product[]) => {
        let filteredProducts: Product[] = products.slice();

        const singularize = (val: string | undefined | null) => {
          if (!val) return '';
          const lower = val.toLowerCase();
          // basic plural removal: bikes -> bike, toys -> toy, laptops -> laptop
          if (lower.endsWith('ies')) return lower.slice(0, -3) + 'y';
          if (lower.endsWith('s')) return lower.slice(0, -1);
          return lower;
        };

        const matchesCategory = (p: Product, cat: string) => {
          const catSing = singularize(cat);
          const typeSing = singularize(p.p_type);
          const subSing = singularize(p.p_subtype);
          return (
            p.p_type === cat ||
            p.p_subtype === cat ||
            typeSing === catSing ||
            subSing === catSing
          );
        };

        // Step 1: Filter by category FIRST (if one is selected)
        // Match against either the product type OR the subtype because backends
        // sometimes return broader types (e.g. "Essentials") with subtypes
        // like "Bike". Users select categories like "Bike" in the UI.
        if (category) {
          filteredProducts = filteredProducts.filter((p) =>
            matchesCategory(p, category)
          );
        }

        // Step 2: Then, filter the result by the search term
        if (searchTerm) {
          const lowerCaseSearchTerm = searchTerm.toLowerCase();
          filteredProducts = filteredProducts.filter((p) => {
            const name = (p.p_name || '').toLowerCase();
            const desc = (p.p_desc || '').toLowerCase();
            const subtype = (p.p_subtype || '').toLowerCase();
            return (
              name.includes(lowerCaseSearchTerm) ||
              desc.includes(lowerCaseSearchTerm) ||
              subtype.includes(lowerCaseSearchTerm)
            );
          });
        }

        // Step 3: Then, apply the sidebar filters
        if (filters) {
          // Price filter: guard for 0 and explicit presence
          if (typeof filters.price !== 'undefined' && filters.price !== null) {
            const priceLimit = Number(filters.price) || 0;
            filteredProducts = filteredProducts.filter(
              (p) => Number(p.p_price) <= priceLimit
            );
          }

          const activeAttributeFilters = new Map<string, string[]>();
          for (const key in filters) {
            if (key === 'price') continue;
            if (filters[key] !== true) continue;

            // Parse control names using the expected separator from the sidebar.
            let group = '';
            let value = '';
            if (key.includes(this.FILTER_CONTROL_SEP)) {
              [group, value] = key.split(this.FILTER_CONTROL_SEP);
            } else if (key.includes('_')) {
              // fallback to older underscore parsing
              [group, value] = key.split('_');
            } else {
              continue;
            }

            group = String(group);
            value = String(value);

            if (!activeAttributeFilters.has(group))
              activeAttributeFilters.set(group, []);
            activeAttributeFilters.get(group)?.push(value);
          }

          if (activeAttributeFilters.size > 0) {
            filteredProducts = filteredProducts.filter((product) => {
              return Array.from(activeAttributeFilters.entries()).every(
                ([group, values]) => {
                  // Special-case Brand which is stored in p_subtype
                  if (group === 'Brand')
                    return values.includes(String(product.p_subtype || ''));

                  // For attribute-based filters compare string values to handle numbers
                  if (product.attribute && product.attribute[group] != null) {
                    const attrVal = String(product.attribute[group]);
                    return values.includes(attrVal);
                  }
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
    this.startAddressListener();
    return this.productsSubject.asObservable().pipe(
      filter((p): p is Product[] => p !== null),
      map((products: Product[]) => {
        const singularize = (val: string | undefined | null) => {
          if (!val) return '';
          const lower = val.toLowerCase();
          if (lower.endsWith('ies')) return lower.slice(0, -3) + 'y';
          if (lower.endsWith('s')) return lower.slice(0, -1);
          return lower;
        };
        const catSing = singularize(category);
        const categoryProducts = products.filter((p) => {
          const typeSing = singularize(p.p_type);
          const subSing = singularize(p.p_subtype);
          return (
            p.p_type === category ||
            p.p_subtype === category ||
            typeSing === catSing ||
            subSing === catSing
          );
        });
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
            const val = product.attribute[key];
            if (val === null || val === undefined) continue;
            const s = String(val).trim();
            if (s === '' || s.toLowerCase() === 'null') continue;
            if (!attributes.has(key)) attributes.set(key, new Set<string>());
            attributes.get(key)?.add(val);
          }
        });
        return { attributes, minPrice, maxPrice };
      })
    );
  }
}
