
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';

import { of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private middlewareUrl = 'http://localhost:3000/users'; // Adjust as needed
  private mockUrl = 'assets/mock-users.json'; // For json-server, use http://localhost:3000/users

  constructor(private http: HttpClient) { }

  /**
   * Calls Node.js middleware for login, stores token in sessionStorage.
   */
  login(username: string, password: string, remember: boolean): Observable<any> {
    return this.http.post<{ token: string }> (
      this.middlewareUrl + 'users',
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
    return this.http.get< { users: any[] } >(this.mockUrl).pipe(
      map(res => 
        {
          const users = res.users;
          console.log(users);
          return users.find(u => u.username === username && u.password === password);
        }),
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
          console.log('Invalid credentials' + user.username);
          throw new Error('Invalid credentials');
        }
      })
    );
  }

  /**
   * Register a new user
   */

  // register(firstName: string, lastName: string, username: string, password: string, address: string): Observable<any> {
  //   const id = this.http.get<any[]>(this.mockUrl).pipe(
  //     map(users => users.length + 1)
  //   );
  //   return this.http.post<any>(
  //     this.middlewareUrl,
  //     { "id": id, "name": firstName+lastName, "username": username, "password": password, "address": address }
  //   );
  // }

  register(
    firstName: string,
    lastName: string,
    username: string,
    password: string,
    address: string
  ): Observable<any> {
    return this.http.get<any[]>(this.mockUrl).pipe(
      map(users => users.length + 1), // compute id as length + 1
      switchMap(id => {
        // create the new user object
        const newUser = {
          id,
          name: firstName + " " + lastName,
          username,
          password,
          address,
          token: "mock-token-abc123"
        };
        // POST the new user
        return this.http.post<any>(this.middlewareUrl, newUser);
      })
    );
  }
  
}
