import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { BehaviorSubject, Observable, switchMap, combineLatest, catchError, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ProductService } from './product.service';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000';

  private applicationMiddleWareUrl = environment.lambda_1;

  private cartSubject = new BehaviorSubject<Order[]>([]);
  public readonly cart$ = this.cartSubject.asObservable();
  private wishlistSubject = new BehaviorSubject<Product[]>([]);
  public readonly wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private http: HttpClient,
    private productService: ProductService,
    private authService: AuthService
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

  // No mockUser. getCurrentUser should fetch from backend if needed, or use AuthService only.
  getCurrentUser(): Observable<User> {
    // If you have a backend endpoint for user, use it here. Otherwise, return user from AuthService.
    const user = this.authService.getCurrentUser();
    // Patch: Ensure returned object matches User type
    if (user && user.user_id) {
      // Fill with minimal User info if only user_id is available
      return of({
        id: user.user_id,
        name: '',
        username: '',
        password: '',
        address: [],
        wishList: [],
        cart: [],
      });
    }
    // If not authenticated, return empty user
    return of({
      id: '',
      name: '',
      username: '',
      password: '',
      address: [],
      wishList: [],
      cart: [],
    });
  }

  addToWishlist(productId: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }
    const url = `${this.applicationMiddleWareUrl}/api/wishlist/add`;
    const body = { user_id: user_id, p_id: productId };
    return this.http.post(url, body);
  }

  getWishList(): Observable<Product[]> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of([]);
    }
    const url = `${this.applicationMiddleWareUrl}/api/wishlist/${user_id}`;
    return this.http.get<{ wishlist: string[] }>(url).pipe(
      // Assume backend returns { wishlist: [p_id, ...] }
      switchMap((resp) => {
        const ids = Array.isArray(resp) ? resp : resp.wishlist;
        if (!ids || ids.length === 0) return of([]);
        // Fetch all products by id in parallel
        const productCalls = ids.map((id: string) => this.productService.getProductById(id));
        return productCalls.length ? combineLatest(productCalls) : of([]);
      }),
      catchError(() => of([]))
    );
  }

  removeFromWishlist(productId: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }
    // Use DELETE with body (Angular supports this via options)
    const url = `${this.applicationMiddleWareUrl}/api/wishlist/remove`;
    const options = { body: { user_id: user_id, p_id: productId } };
    return this.http.delete(url, options);
  }

  isInWishlist(productId: string): boolean {
    // This should check from the current wishlistSubject value
    const wishlist = this.wishlistSubject.value;
    return wishlist.some((p) => p.p_id === productId);
  }

  toggleWishlist(product: Product): Observable<{ added: boolean }> {
    // You may want to check if in wishlist and call remove or add accordingly
    if (this.isInWishlist(product.p_id)) {
      return this.removeFromWishlist(product.p_id).pipe(
        switchMap(() => of({ added: false }))
      );
    } else {
      return this.addToWishlist(product.p_id).pipe(
        switchMap(() => of({ added: true }))
      );
    }
  }

  addToCart(productId: string, quantity: number): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }
    let price = 100;
    const currentProducts = (this.productService as any).productsSubject?.value as Product[] | null;
    if (currentProducts) {
      const found = currentProducts.find((p) => p.p_id === productId);
      if (found) price = Number(found.p_price) || price;
    }
    const body = {
      user_id,
      p_id: productId,
      quantity,
      amount: price * quantity,
    };
    const url = `${this.applicationMiddleWareUrl}/api/order/place`;
    return this.http.post<Order>(url, body);
  }

  getCart(): Observable<Order[]> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of([]);
    }
    const url = `${this.applicationMiddleWareUrl}/api/order/${user_id}`;
    return this.http.get<{ items: Order[] }>(url).pipe(
      switchMap((resp) => {
        const orders = Array.isArray(resp) ? resp : resp.items;
        if (!orders || orders.length === 0) return of([]);
        // Fetch product details for each order
        const enrichedOrders$ = orders.map((order) =>
          this.productService.getProductById(order.p_id).pipe(
            switchMap((product) => {
              const enrichedOrder = { ...order, product };
              return of(enrichedOrder);
            }),
            catchError(() => of(order))
          )
        );
        return combineLatest(enrichedOrders$);
      }),
      catchError(() => of([]))
    );
  }


  removeFromCart(orderId: string): Observable<any> {
  const user = this.authService.getCurrentUser();
  const user_id = user && user.user_id ? user.user_id : null;
  if (!user_id) {
    return of({ success: false, error: 'User not authenticated' });
  }

  const url = `${this.applicationMiddleWareUrl}/api/order/delete/${encodeURIComponent(orderId)}`;
  return this.http.delete(url);
}

updateCartItem(orderId: string, quantity: number, amount: number): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }

    const url = `${this.applicationMiddleWareUrl}/order/update/${encodeURIComponent(orderId)}`;
    const body = {
      quantity,
      amount,
    };

    return this.http.put(url, body);
  }


  updateCart(cart: Order[]): Observable<any> {
    // This should update each cart item in backend if needed, or just refresh local state from backend
    // If you have a batch update endpoint, use it here. Otherwise, update each item individually.
    // For now, just refresh cart from backend
    return this.getCart().pipe(
      switchMap((orders) => {
        this.cartSubject.next([...orders]);
        return of({ success: true });
      })
    );
  }

  checkoutCart(): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }
    // Get all orders from backend
    return this.getCart().pipe(
      switchMap((orders) => {
        if (!orders || orders.length === 0) {
          this.cartSubject.next([]);
          return of({ success: true });
        }
        const deleteCalls = orders.map(order => {
          const url = `${this.applicationMiddleWareUrl}/api/order/delete/${encodeURIComponent(order.o_id)}`;
          return this.http.delete(url).pipe(catchError(() => of({ success: false, orderId: order.o_id })));
        });
        return combineLatest(deleteCalls).pipe(
          switchMap(() => {
            this.cartSubject.next([]);
            return of({ success: true });
          })
        );
      })
    );
  }
}
