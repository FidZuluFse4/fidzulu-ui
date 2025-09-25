import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { BehaviorSubject, of, Observable, switchMap, combineLatest, catchError } from 'rxjs';
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
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    console.log("User_id: " + user_id);
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }
    const url = `${this.applicationMiddleWareUrl}/api/wishlist/add`;
    const url2 = `${this.applicationMiddleWareUrl}/api/wishlist/${user_id}`;
    const body = { user_id: user_id, p_id: productId };
    const res = this.http.post(url, body);
    console.log(this.http.get(url2));
    return res;
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
    // Use DELETE with query params for RESTful API
    const url = `${this.applicationMiddleWareUrl}/api/wishlist/remove?user_id=${encodeURIComponent(user_id)}&p_id=${encodeURIComponent(productId)}`;
    return this.http.delete(url);
  }

  isInWishlist(productId: string): boolean {
    return this.mockUser.wishList.some((p) => p.p_id === productId);
  }

  toggleWishlist(product: Product): Observable<{ added: boolean }> {
    // if (this.isInWishlist(product.p_id)) {
    //   this.mockUser.wishList = this.mockUser.wishList.filter(
    //     (p) => p.p_id !== product.p_id
    //   );
    //   this.wishlistSubject.next([...this.mockUser.wishList]);
    //   return of({ added: false });
    // } else {
    //   // store a shallow copy to avoid accidental mutations
    //   const copy: Product = { ...product };
    //   this.mockUser.wishList.push(copy);
    //   this.wishlistSubject.next([...this.mockUser.wishList]);
    //   return of({ added: true });
    // }

    return this.addToWishlist(product.p_id);
  }

  addToCart(productId: string, quantity: number): Observable<any> {
    const user = this.authService.getCurrentUser();
    const user_id = user && user.user_id ? user.user_id : null;
    if (!user_id) {
      return of({ success: false, error: 'User not authenticated' });
    }

    // Determine price from current products if available
    let price = 100; // fallback
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
              // Attach product to order
              const enrichedOrder = { ...order, product };
              return of(enrichedOrder);
            }),
            catchError(() => of(order)) // fallback to plain order if product fetch fails
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
