
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

class MockAuthService {
  register = jasmine.createSpy().and.returnValue(of({ user_id: '123', name: 'Test User', email: 'test@example.com' }));
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have all form controls required', () => {
    const controls = component.registerForm.controls;
    expect(controls['firstName'].validator).toBeTruthy();
    expect(controls['lastName'].validator).toBeTruthy();
    expect(controls['email'].validator).toBeTruthy();
    expect(controls['password'].validator).toBeTruthy();
    expect(controls['confirmPassword'].validator).toBeTruthy();
    expect(controls['location'].validator).toBeTruthy();
    expect(controls['address'].validator).toBeTruthy();
  });

  it('should mark form invalid if required fields are missing', () => {
    component.registerForm.setValue({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: '',
      address: ''
    });
    expect(component.registerForm.invalid).toBeTrue();
  });

  it('should show error if email is invalid', () => {
    const email = component.registerForm.controls['email'];
    email.setValue('notanemail');
    email.markAsTouched();
    fixture.detectChanges();
    expect(email.invalid).toBeTrue();
    expect(email.errors?.['email']).toBeTrue();
  });

  it('should show error if password does not meet constraints', () => {
    const password = component.registerForm.controls['password'];
    password.setValue('short');
    password.markAsTouched();
    fixture.detectChanges();
    expect(password.invalid).toBeTrue();
    expect(password.errors?.['minlength']).toBeTruthy();
    password.setValue('alllowercase1!');
    fixture.detectChanges();
    expect(password.errors?.['pattern']).toBeTruthy();
  });

  it('should show error if confirm password does not match', () => {
    component.registerForm.controls['password'].setValue('Password1!');
    component.registerForm.controls['confirmPassword'].setValue('Password2!');
    component.registerForm.controls['confirmPassword'].markAsTouched();
    component.registerForm.updateValueAndValidity();
    fixture.detectChanges();
    expect(component.registerForm.controls['confirmPassword'].errors?.['mismatch']).toBeTrue();
  });

  it('should call AuthService.register and navigate on valid submit', fakeAsync(() => {
    component.registerForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      location: 'Sydney',
      address: '123 Main St'
    });
    component.onSubmit();
    tick();
    expect(authService.register).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should not call AuthService.register if form is invalid', () => {
    component.registerForm.setValue({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: '',
      address: ''
    });
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should handle registration error', fakeAsync(() => {
    authService.register.and.returnValue(throwError(() => new Error('Registration failed')));
    component.registerForm.setValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      location: 'Melbourne',
      address: '456 Main St'
    });
    component.onSubmit();
    tick();
    expect(authService.register).toHaveBeenCalled();
    // No navigation on error
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should validate passwordsMatchValidator correctly', () => {
    const group = component.registerForm;
    // Set matching passwords: no error
    group.controls['password'].setValue('Password1!');
    group.controls['confirmPassword'].setValue('Password1!');
    group.updateValueAndValidity();
    expect(group.controls['confirmPassword'].errors).toBeNull();
    // Set non-matching passwords: mismatch error
    group.controls['confirmPassword'].setValue('Different1!');
    group.updateValueAndValidity();
    expect(group.controls['confirmPassword'].errors?.['mismatch']).toBeTrue();
    // Now set back to matching passwords: mismatch error should be removed and errors set to null
    group.controls['confirmPassword'].setValue('Password1!');
    group.updateValueAndValidity();
    expect(group.controls['confirmPassword'].errors).toBeNull();
  });
});
