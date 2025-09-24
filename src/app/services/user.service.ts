import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Mock user for now
  private sampleUser: User = {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    password: 'password',
    address: [],
    wishList: [],
    cart: []
  };

  private currentUserSubject = new BehaviorSubject<User>(this.sampleUser);

  constructor(
    // Uncomment when backend is ready
    // private http: HttpClient
  ) {}

  /** Get the current user */
  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  /** Set the current user */
  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
  }

  /** Update the user's cart (for mock & frontend now) */
  updateUserCart(cart: Order[]) {
    const user = this.getCurrentUser();
    user.cart = cart;
    this.setCurrentUser(user);
    console.log('Cart updated:', cart);

    // Uncomment when backend API is ready
    /*
    this.http.put(`https://your-backend-api.com/users/${user.id}/cart`, cart)
      .subscribe({
        next: (res) => console.log('Cart updated on backend', res),
        error: (err) => console.error('Error updating cart', err)
      });
    */
  }

  /** Update the user's wishlist */
  updateUserWishlist(wishList: any[]) {
    const user = this.getCurrentUser();
    user.wishList = wishList;
    this.setCurrentUser(user);
    console.log('Wishlist updated:', wishList);

    // Uncomment when backend API is ready
    /*
    this.http.put(`https://your-backend-api.com/users/${user.id}/wishlist`, wishList)
      .subscribe({
        next: (res) => console.log('Wishlist updated on backend', res),
        error: (err) => console.error('Error updating wishlist', err)
      });
    */
  }
}
