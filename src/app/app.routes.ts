import { provideRouter, Routes } from '@angular/router';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { ProductsPageComponent } from './component/product-page/product-page.component';

export const routes: Routes = [
  { path: 'landing', component: ProductsPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];
