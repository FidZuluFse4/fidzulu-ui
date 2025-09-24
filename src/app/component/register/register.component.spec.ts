import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

class MockAuthService {
  register = jasmine
    .createSpy('register')
    .and.returnValue(of({ user_id: '1' }));
}
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let auth: MockAuthService;
  let router: MockRouter;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    auth = TestBed.inject(AuthService) as any;
    router = TestBed.inject(Router) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark invalid when required fields missing', () => {
    component.onSubmit();
    expect(component.registerForm.invalid).toBeTrue();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('should submit and navigate on valid form', () => {
    const f = component.registerForm;
    f.setValue({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      password: 'Abcdef1!',
      confirmPassword: 'Abcdef1!',
      location: 'India',
      address: 'Addr',
    });
    component.onSubmit();
    expect(auth.register).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should flag mismatch error when passwords differ', () => {
    const f = component.registerForm;
    f.patchValue({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      password: 'Abcdef1!',
      confirmPassword: 'Different1!',
      location: 'India',
      address: 'Addr',
    });
    component.onSubmit();
    expect(f.get('confirmPassword')?.errors?.['mismatch']).toBeTrue();
  });

  it('should handle register error gracefully', () => {
    auth.register.and.returnValue(throwError(() => new Error('fail')));
    const f = component.registerForm;
    f.setValue({
      firstName: 'A',
      lastName: 'B',
      email: 'a@b.com',
      password: 'Abcdef1!',
      confirmPassword: 'Abcdef1!',
      location: 'India',
      address: 'Addr',
    });
    component.onSubmit();
    expect(auth.register).toHaveBeenCalled();
  });
});
