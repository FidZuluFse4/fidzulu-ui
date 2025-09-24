
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';

import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Returns true if a valid auth token is present in sessionStorage.
   */
  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('auth_token');
    // Optionally, add more checks (e.g., token expiry) here
    return !!token;
  }

  /**
   * Logs out the user by clearing session storage.
   */
  logout(): void {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('remembered_username');
    // Add any other cleanup if needed
  }

  private middlewareUrl_local_login = 'http://localhost:9090/api/auth/login';
  private middlewareUrl_local_register = 'http://localhost:9090/api/auth/register';

  constructor(private http: HttpClient) { }

  /**
   * Calls Node.js middleware for login, stores token in sessionStorage.
   */
  login(username: string, password: string, remember: boolean): Observable<any> {
    const body = { email:username, password: password };
    console.log("Body: " + body);
    return this.http.post<{ user_id: string, token: string }> (
      this.middlewareUrl_local_login,
      body
    ).pipe(
      tap(res => {
        if (res && res.token) {
          sessionStorage.setItem('auth_token', res.token);
          sessionStorage.setItem('user_id', res.user_id);
          if (remember) {
            sessionStorage.setItem('remembered_username', username);
          } else {
            sessionStorage.removeItem('remembered_username');
          }
        }
      })
    );
  }

  /**
   * Register a new user
   */
  register(
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    location: string,
    address: string
  ): Observable<any> {
    const body = {name: firstName + " " + lastName, email: username, password: password, addresses: [{location: location, full_address: address}]};

    return this.http.post<{ user_id: string, name: string, email: string }>(this.middlewareUrl_local_register, body);
  }

  getCurrentUser(): { user_id: string | null, auth_token: string | null } {
    return {
      user_id: sessionStorage.getItem('user_id'),
      auth_token: sessionStorage.getItem('auth_token')
    }
    }
}
