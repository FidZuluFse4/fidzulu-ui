import { Component } from '@angular/core';
import { FooterComponent } from '../../component/footer/footer.component';
import { HeaderComponent } from '../../component/header/header.component';
import { AboutUsComponent } from '../../component/about-us/about-us.component';

@Component({
  selector: 'app-about-route',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, AboutUsComponent],
  templateUrl: './about-route.component.html',
  styleUrl: './about-route.component.css',
})
export class AboutRouteComponent {}
