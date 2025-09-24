import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/1`);
  }

  addToWishlist(productId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/wishlist`, { productId });
  }

  removeFromWishlist(productId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/wishlist/${productId}`);
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/cart`, { productId, quantity });
  }

  removeFromCart(orderId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cart/${orderId}`);
  }

  updateCart(cart: Order[]): Observable<any> {
  return this.http.patch(`${this.baseUrl}/users/1`, { cart });
  }

  checkoutCart(): Observable<any> {
    return this.http.post(`${this.baseUrl}/checkout`, {});
  }

}

