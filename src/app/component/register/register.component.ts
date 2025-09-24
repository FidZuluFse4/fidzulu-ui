import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  formValidated = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/)]],
      confirmPassword: ['', Validators.required],
      address: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  get f() { return this.registerForm.controls; }

  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ ...group.get('confirmPassword')?.errors, mismatch: true });
      return { mismatch: true };
    } else {
      if (group.get('confirmPassword')?.hasError('mismatch')) {
        const errors = { ...group.get('confirmPassword')?.errors };
        delete errors['mismatch'];
        if (Object.keys(errors).length === 0) {
          group.get('confirmPassword')?.setErrors(null);
        } else {
          group.get('confirmPassword')?.setErrors(errors);
        }
      }
      return null;
    }
  };

  onSubmit() {
    this.formValidated = true;
    if (this.registerForm.invalid) {
      console.log('Form is invalid', this.registerForm.value, this.registerForm.errors);
      return;
    }
    this.authService.register(this.registerForm.value.firstName, this.registerForm.value.lastName, this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.address).subscribe({
      next: (res) => {
        console.log('User registered', res);
      },
      error: (err) => {
        console.log('User registration failed', err);
      }
    });
    console.log('Form is valid', this.registerForm.value);
  }
}
