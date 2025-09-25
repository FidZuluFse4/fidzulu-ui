import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

// Helpers to read cookies in test environment
function readCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.startsWith(nameEQ))
      return decodeURIComponent(c.substring(nameEQ.length));
  }
  return null;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    // Clear cookies between tests
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set cookies', () => {
    service.login('user@test.com', 'pass', true).subscribe((res) => {
      expect(res.token).toBe('abc');
      expect(readCookie('auth_token')).toBe('abc');
      expect(readCookie('user_id')).toBe('u1');
      expect(readCookie('remembered_username')).toBe('user@test.com');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getToken()).toBe('abc');
    });

    const req = httpMock.expectOne(`${environment.lambda_1}/api/auth/login`);
    req.flush({ user_id: 'u1', token: 'abc' });
  });

  it('should logout and clear cookies', () => {
    // pre-set cookies
    document.cookie = 'auth_token=tok;path=/';
    document.cookie = 'user_id=u1;path=/';
    service.logout();
    expect(readCookie('auth_token')).toBeNull();
    expect(readCookie('user_id')).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
