
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

class MockAuthService {
  login = jasmine.createSpy().and.returnValue(of({ user_id: '123', token: 'abc' }));
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
        { provide: Router, useClass: MockRouter }
      ]
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

  it('should have all form controls required', () => {
    const controls = component.loginForm.controls;
    expect(controls['username'].validator).toBeTruthy();
    expect(controls['password'].validator).toBeTruthy();
    expect(controls['remember'].validator).toBeTruthy();
  });

  it('should mark form invalid if required fields are missing', () => {
    component.loginForm.setValue({ username: '', password: '', remember: false });
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should show error if username is not an email', () => {
    const username = component.loginForm.controls['username'];
    username.setValue('notanemail');
    username.markAsTouched();
    fixture.detectChanges();
    expect(username.invalid).toBeTrue();
    expect(username.errors?.['email']).toBeTrue();
  });

  it('should not call AuthService.login if form is invalid (onSubmit)', () => {
    component.loginForm.setValue({ username: '', password: '', remember: false });
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should not call AuthService.login if form is invalid (onSubmitMock)', () => {
    component.loginForm.setValue({ username: '', password: '', remember: false });
    component.onSubmitMock();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should call AuthService.login and navigate on valid submit (onSubmit)', fakeAsync(() => {
    component.loginForm.setValue({ username: 'test@example.com', password: 'Password1!', remember: true });
    component.onSubmit();
    tick();
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'Password1!', true);
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
    expect(component.loginError).toBeNull();
  }));

  it('should call AuthService.login and navigate on valid submit (onSubmitMock)', fakeAsync(() => {
    component.loginForm.setValue({ username: 'test@example.com', password: 'Password1!', remember: false });
    component.onSubmitMock();
    tick();
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'Password1!', false);
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
    expect(component.loginError).toBeNull();
  }));

  it('should set loginError on failed login (onSubmit)', fakeAsync(() => {
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));
    component.loginForm.setValue({ username: 'fail@example.com', password: 'Password1!', remember: false });
    component.onSubmit();
    tick();
    expect(authService.login).toHaveBeenCalled();
    expect(component.loginError).toBe('Login failed. Please check your credentials.');
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should set loginError on failed login (onSubmitMock)', fakeAsync(() => {
    authService.login.and.returnValue(throwError(() => new Error('Login failed')));
    component.loginForm.setValue({ username: 'fail@example.com', password: 'Password1!', remember: false });
    component.onSubmitMock();
    tick();
    expect(authService.login).toHaveBeenCalled();
    expect(component.loginError).toBe('Login failed. Please check your credentials.');
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should set submitted to true and clear loginError on submit', () => {
    component.loginError = 'Some error';
    component.submitted = false;
    component.loginForm.setValue({ username: '', password: '', remember: false });
    component.onSubmit();
    expect(component.submitted).toBeTrue();
    expect(component.loginError).toBeNull();
  });

  it('should set submitted to true and clear loginError on submitMock', () => {
    component.loginError = 'Some error';
    component.submitted = false;
    component.loginForm.setValue({ username: '', password: '', remember: false });
    component.onSubmitMock();
    expect(component.submitted).toBeTrue();
    expect(component.loginError).toBeNull();
  });
});
