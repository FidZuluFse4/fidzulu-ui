import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  private cartSubject = new BehaviorSubject<Order[]>([]);
  public readonly cart$ = this.cartSubject.asObservable();
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public readonly wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {}

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
    // Backward compatibility: try to resolve real product first
    const currentProducts = (this.productService as any).productsSubject
      ?.value as Product[] | null;
    let found: Product | undefined = undefined;
    if (currentProducts) {
      found = currentProducts.find((p) => p.p_id === productId);
    }
    if (!found) {
      // fallback minimal product (should be rare)
      found = {
        p_id: productId,
        p_type: 'generic',
        p_name: 'Product',
        p_price: 0,
        p_currency: '$',
      } as Product;
    }
    if (!this.mockUser.wishList.some((p) => p.p_id === productId)) {
      this.mockUser.wishList.push(found);
      this.wishlistSubject.next([...this.mockUser.wishList]);
    }
    return of({ success: true, added: true });
  }

  removeFromWishlist(productId: string): Observable<any> {
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
