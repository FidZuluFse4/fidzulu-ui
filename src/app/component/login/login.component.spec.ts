import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

class MockAuthService {
  login = jasmine
    .createSpy('login')
    .and.returnValue(of({ token: 't123', user_id: 'u1' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form invalid if untouched submit', () => {
    expect(component.loginForm.invalid).toBeTrue();
    component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call authService.login and navigate on success', fakeAsync(() => {
    component.loginForm.setValue({
      username: 'a@b.com',
      password: 'pw',
      remember: true,
    });
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith('a@b.com', 'pw', true);
    // simulate async
    tick();
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
    expect(component.loginError).toBeNull();
  }));

  it('should set loginError on failure', fakeAsync(() => {
    authService.login.and.returnValue(throwError(() => new Error('bad creds')));
    component.loginForm.setValue({
      username: 'x@y.com',
      password: 'bad',
      remember: false,
    });
    component.onSubmit();
    tick();
    expect(component.loginError).toBeTruthy();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('onSubmitMock should behave similarly on success', fakeAsync(() => {
    component.loginForm.setValue({
      username: 'mock@user.com',
      password: 'pw',
      remember: false,
    });
    component.onSubmitMock();
    tick();
    expect(authService.login).toHaveBeenCalledWith(
      'mock@user.com',
      'pw',
      false
    );
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
  }));

  it('onSubmitMock should set error on failure', fakeAsync(() => {
    authService.login.and.returnValue(throwError(() => new Error('fail mock')));
    component.loginForm.setValue({
      username: 'err@user.com',
      password: 'pw',
      remember: false,
    });
    component.onSubmitMock();
    tick();
    expect(component.loginError).toContain('Login failed');
  }));
});
