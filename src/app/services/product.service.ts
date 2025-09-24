import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  /** Fetch product by ID from local JSON */
  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<Product[]>('assets/product.json')
      .pipe(
        map(products => products.find(p => p.p_id === id))
      );
  }

  /**
   * Uncomment this when backend API is ready
   */
  /*
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`https://your-backend-api.com/products/${id}`);
  }
  */
}
