
import { of, throwError } from 'rxjs';
import * as env from '../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

// Cookie helpers
function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }
  return null;
}

function eraseAllCookies() {
  document.cookie.split(';').forEach(c => {
    document.cookie = c.replace(/^ +/, '')
      .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
  });
}

describe('AuthService', () => {
  let service: AuthService;
  let http: jasmine.SpyObj<HttpClient>;


  beforeEach(() => {
    // Patch the real environment object so AuthService uses the mock URL
    (env.environment as any).lambda_1 = 'https://mock-lambda-url';

    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['post']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: http }
      ]
    });

    service = TestBed.inject(AuthService);
    eraseAllCookies();
  });

  afterEach(() => {
    eraseAllCookies();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call http.post with correct url and body', (done) => {
      http.post.and.returnValue(of({ user_id: 'u1', token: 't1' }));

      service.login('test@example.com', 'pw', true).subscribe(() => {
        expect(http.post).toHaveBeenCalledWith(
          'https://mock-lambda-url/api/auth/login',
          { email: 'test@example.com', password: 'pw' }
        );
        done();
      });
    });

    it('should set cookies if remember is true', (done) => {
      http.post.and.returnValue(of({ user_id: 'u2', token: 't2' }));

      service.login('remember@me.com', 'pw', true).subscribe(() => {
        expect(getCookie('auth_token')).toBe('t2');
        expect(getCookie('user_id')).toBe('u2');
        expect(getCookie('remembered_username')).toBe('remember@me.com');
        done();
      });
    });

    it('should erase remembered_username if remember is false', (done) => {
      document.cookie = 'remembered_username=toRemove; path=/';
      http.post.and.returnValue(of({ user_id: 'u3', token: 't3' }));

      service.login('noremember@me.com', 'pw', false).subscribe(() => {
        expect(getCookie('auth_token')).toBe('t3');
        expect(getCookie('user_id')).toBe('u3');
        expect(getCookie('remembered_username')).toBeNull();
        done();
      });
    });

    it('should not set cookies if no token is returned', (done) => {
      http.post.and.returnValue(of({ user_id: 'u4' }));

      service.login('no-token@me.com', 'pw', false).subscribe(() => {
        expect(getCookie('auth_token')).toBeNull();
        expect(getCookie('user_id')).toBeNull();
        done();
      });
    });

    it('should propagate http errors', (done) => {
      http.post.and.returnValue(throwError(() => new Error('fail')));

      service.login('fail@me.com', 'pw', false).subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          expect(err.message).toBe('fail');
          done();
        }
      });
    });
  });

  describe('register', () => {
    it('should call http.post with correct url and body', (done) => {
      http.post.and.returnValue(of({ user_id: 'u5', name: 'Test User', email: 'test@reg.com' }));

      service.register('First', 'Last', 'test@reg.com', 'pw', 'Loc', 'Addr').subscribe(res => {
        expect(http.post).toHaveBeenCalledWith(
          'https://mock-lambda-url/api/auth/register',
          {
            name: 'First Last',
            email: 'test@reg.com',
            password: 'pw',
            addresses: [{ location: 'Loc', full_address: 'Addr' }]
          }
        );
        expect(res).toEqual({ user_id: 'u5', name: 'Test User', email: 'test@reg.com' });
        done();
      });
    });

    it('should propagate errors from http.post', (done) => {
      http.post.and.returnValue(throwError(() => new Error('regfail')));

      service.register('F', 'L', 'fail@reg.com', 'pw', 'Loc', 'Addr').subscribe({
        error: (err) => {
          expect(err).toBeTruthy();
          expect(err.message).toBe('regfail');
          done();
        }
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if auth_token exists', () => {
      document.cookie = 'auth_token=tokenval; path=/';
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false if no auth_token', () => {
      eraseAllCookies();
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should clear all relevant cookies', () => {
      document.cookie = 'auth_token=tok; path=/';
      document.cookie = 'user_id=uid; path=/';
      document.cookie = 'remembered_username=rem; path=/';

      service.logout();

      expect(getCookie('auth_token')).toBeNull();
      expect(getCookie('user_id')).toBeNull();
      expect(getCookie('remembered_username')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return values from cookies', () => {
      document.cookie = 'auth_token=tok; path=/';
      document.cookie = 'user_id=uid; path=/';

      const user = service.getCurrentUser();
      expect(user.auth_token).toBe('tok');
      expect(user.user_id).toBe('uid');
    });

    it('should return nulls if no cookies set', () => {
      eraseAllCookies();

      const user = service.getCurrentUser();
      expect(user.auth_token).toBeNull();
      expect(user.user_id).toBeNull();
    });
  });
});
