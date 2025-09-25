import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  private applicationBaseUrl = environment.applicationUrlBackend;

  private applicationMiddleWareUrl = environment.lambda_1;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // getCurrentUser(): Observable<User> {
  //   return this.http.get<User>(`${this.baseUrl}/users/1`);
  // }

  // addToWishlist(productId: number): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/wishlist`, { productId });
  // }

  // removeFromWishlist(productId: number): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}/wishlist/${productId}`);
  // }

  // addToCart(productId: number, quantity: number): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/cart`, { productId, quantity });
  // }

  // removeFromCart(orderId: number): Observable<any> {
  //   return this.http.delete(`${this.baseUrl}/cart/${orderId}`);
  // }

  // updateCart(cart: Order[]): Observable<any> {
  //   return this.http.patch(`${this.baseUrl}/users/1`, { cart });
  // }

  // checkoutCart(): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/checkout`, {});
  // }

  // ================= MOCK IMPLEMENTATION =================
  private mockUser: User = {
    id: '1',
    name: 'Rimjhim',
    username: 'rimjhim123',
    password: 'password',
    address: [],
    wishList: [],
    cart: [],
  };

  getCurrentUser(): Observable<User> {
    // keep cartSubject synced
    this.cartSubject.next(this.mockUser.cart);
    this.wishlistSubject.next(this.mockUser.wishList);
    return of(this.mockUser);
  }

  addToWishlist(productId: string): Observable<any> {
    // Get user_id from AuthService robustly
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    console.log("User_id: " + user_id);
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }
    const url = `${this.applicationMiddleWareUrl}/api/wishlist/add`;
    const body = { user_id: user_id, p_id: productId };
    return this.http.post(url, body);
  }

  removeFromWishlist(productId: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    console.log("User_id: " + user_id);
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }

    const url = `${this.applicationBaseUrl}/api/wishlist/remove`;
    this.mockUser.wishList = this.mockUser.wishList.filter(
      (p) => p.p_id !== productId
    );
    this.wishlistSubject.next([...this.mockUser.wishList]);
    return of({ success: true });
  }

  isInWishlist(productId: string): boolean {
    return this.mockUser.wishList.some((p) => p.p_id === productId);
  }

  toggleWishlist(product: Product): Observable<{ added: boolean }> {
    if (this.isInWishlist(product.p_id)) {
      this.mockUser.wishList = this.mockUser.wishList.filter(
        (p) => p.p_id !== product.p_id
      );
      this.wishlistSubject.next([...this.mockUser.wishList]);
      return of({ added: false });
    } else {
      // store a shallow copy to avoid accidental mutations
      const copy: Product = { ...product };
      this.mockUser.wishList.push(copy);
      this.wishlistSubject.next([...this.mockUser.wishList]);
      return of({ added: true });
    }
  }

  addToCart(productId: string, quantity: number): Observable<any> {
    // Determine price from current products if available
    let price = 100; // fallback
    const currentProducts = (this.productService as any).productsSubject
      ?.value as Product[] | null;
    if (currentProducts) {
      const found = currentProducts.find((p) => p.p_id === productId);
      if (found) price = Number(found.p_price) || price;
    }

    const existingOrder = this.mockUser.cart.find((o) => o.p_id === productId);
    if (existingOrder) {
      existingOrder.quantity = quantity; // set to passed quantity (grid passes current)
      existingOrder.amount = existingOrder.quantity * price;
    } else {
      const mockOrder: Order = {
        o_id: Date.now().toString(),
        p_id: productId,
        user_id: this.mockUser.id.toString(),
        quantity,
        amount: price * quantity,
      };
      this.mockUser.cart.push(mockOrder);
    }
    this.cartSubject.next([...this.mockUser.cart]);
    return of({ success: true });
  }

  removeFromCart(orderId: string): Observable<any> {
    this.mockUser.cart = this.mockUser.cart.filter((o) => o.o_id !== orderId);
    this.cartSubject.next([...this.mockUser.cart]);
    return of({ success: true });
  }

  updateCart(cart: Order[]): Observable<any> {
    this.mockUser.cart = [...cart];
    this.cartSubject.next([...this.mockUser.cart]);
    return of({ success: true });
  }

  checkoutCart(): Observable<any> {
    this.mockUser.cart = [];
    this.cartSubject.next([]);
    return of({ success: true });
  }
}
