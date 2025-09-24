

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';

// Simple cookie helpers
function setCookie(name: string, value: string, days: number) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return decodeURIComponent(c.substring(nameEQ.length,c.length));
  }
  return null;
}

function eraseCookie(name: string) {
  document.cookie = name+'=; Max-Age=-99999999; path=/';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * Returns true if a valid auth token is present in sessionStorage.
   */

  isAuthenticated(): boolean {
    const token = getCookie('auth_token');
    return !!token;
  }

  /**
   * Logs out the user by clearing session storage.
   */
  logout(): void {
    eraseCookie('auth_token');
    eraseCookie('user_id');
    eraseCookie('remembered_username');
    // Add any other cleanup if needed
  }

  private middlewareUrl_local_login = "https://yb2t3volwkwisgyiuj72w3p25y0csyfc.lambda-url.ap-southeast-2.on.aws/api/auth/login";
  private middlewareUrl_local_register = "https://yb2t3volwkwisgyiuj72w3p25y0csyfc.lambda-url.ap-southeast-2.on.aws/api/auth/register";

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
          setCookie('auth_token', res.token, remember ? 30 : 1);
          setCookie('user_id', res.user_id, remember ? 30 : 1);
          if (remember) {
            setCookie('remembered_username', username, 30);
          } else {
            eraseCookie('remembered_username');
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
    const res = this.http.post<{ user_id: string, name: string, email: string }>(this.middlewareUrl_local_register, body);
    console.log("Register response: " + res);
    return res;
  }

  getCurrentUser(): { user_id: string | null, auth_token: string | null } {
    return {
      user_id: getCookie('user_id'),
      auth_token: getCookie('auth_token')
    };
  }
}
