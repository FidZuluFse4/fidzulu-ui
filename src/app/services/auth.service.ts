
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private middlewareUrl = 'assets/mock-users.json'; // Adjust as needed
  private mockUrl = 'assets/mock-users.json'; // For json-server, use http://localhost:3000/users

  constructor(private http: HttpClient) { }

  /**
   * Calls Node.js middleware for login, stores token in sessionStorage.
   */
  login(username: string, password: string, remember: boolean): Observable<any> {
    return this.http.post<{ token: string }> (
      this.middlewareUrl,
      { username, password }
    ).pipe(
      tap(res => {
        if (res && res.token) {
          sessionStorage.setItem('auth_token', res.token);
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
   * Mock login using json-server and mock-users.json
   */
  login_mock(username: string, password: string, remember: boolean): Observable<any> {
    // If using json-server, use http://localhost:3000/users?username=...&password=...
    // For static file, must fetch all and filter client-side
    return this.http.get<any[]>(this.mockUrl).pipe(
      map(users => users.find(u => u.username === username && u.password === password)),
      tap(user => {
        if (user && user.token) {
          sessionStorage.setItem('auth_token', user.token);
          if (remember) {
            sessionStorage.setItem('remembered_username', username);
          } else {
            sessionStorage.removeItem('remembered_username');
          }
        }
      }),
      map(user => {
        if (user && user.token) {
          return { token: user.token, username: user.username };
        } else {
          throw new Error('Invalid credentials');
        }
      })
    );
  }
}
