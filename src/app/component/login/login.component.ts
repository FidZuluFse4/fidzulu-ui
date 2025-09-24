
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loginError: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.loginError = null;
    if (this.loginForm.invalid) {
      return;
    }
    const { username, password, remember } = this.loginForm.value;
    this.authService.login(username, password, remember).subscribe({
      next: (res) => {
        // Token is now stored in sessionStorage by AuthService
        // You can add navigation or success logic here
      },
      error: (err) => {
        this.loginError = 'Login failed. Please check your credentials.';
      }
    });
  }

  onSubmitMock() {
    this.submitted = true;
    this.loginError = null;
    if (this.loginForm.invalid) {
      return;
    }
    const { username, password, remember } = this.loginForm.value;
    this.authService.login_mock(username, password, remember).subscribe({
      next: (res) => {
        // Token is now stored in sessionStorage by AuthService
        console.log("You're logged in");
        this.router.navigate(['/landing']);
        console.log("You're logged in - 2");
        console.log(res);
      },
      error: (err) => {
        this.loginError = 'Login failed. Please check your credentials.';
        console.log("Login failed. Please check your credentials.")
      }
    });
  }
}
