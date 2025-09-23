import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FooterComponent} from './component/footer/footer.component';
import {HeaderComponent} from './component/header/header.component';
import {LandingPageComponent} from './component/landing-page/landing-page.component';
import { LoginComponent } from "./component/login/login.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, LandingPageComponent, LoginComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'fidzulu-ui';
}
