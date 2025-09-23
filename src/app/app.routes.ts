import { provideRouter, Routes } from '@angular/router';
import { LandingPageComponent } from './component/landing-page/landing-page.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';

export const routes: Routes = [
    {path: "landing", component: LandingPageComponent},
    {path: "login", component: LoginComponent},
    {path: "register", component: RegisterComponent}
];
