import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Observable, catchError, of, throwError } from 'rxjs';
import { Orders } from '../models/orders.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class OrderHistoryService {
  private orderHistoryUrl: string;

  constructor(private authService: AuthService, private http: HttpClient) {
    this.orderHistoryUrl = `${environment.lambda_1}/api/order/history`;
  }

  /**
   * Get order history for the currently logged in user
   * @returns Observable with list of orders or error
   */
  getOrderHistory(): Observable<Orders[]> {
    const userId = this.authService.getCurrentUser().user_id;

    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.orderHistoryUrl}/68d4cd8fa69db91d8a15f495`;
    return this.http.get<Orders[]>(url).pipe(catchError(this.handleError));
  }

  /**
   * Get a specific order by its ID
   * @param orderId The ID of the order to retrieve
   * @returns Observable with the order details or error
   */
  getOrderById(orderId: string): Observable<Orders> {
    const userId = this.authService.getCurrentUser().user_id;

    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const url = `${this.orderHistoryUrl}/${userId}/${orderId}`;
    return this.http.get<Orders>(url).pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   * @param error The error response
   * @returns An observable with an error message
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 404) {
        if (error.url?.includes('/api/order/history/')) {
          return throwError(
            () => new Error('No orders found. Your order history is empty.')
          );
        }
      }
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
