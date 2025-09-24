import { Component } from '@angular/core';
import { FooterComponent } from '../../component/footer/footer.component';
import { HeaderComponent } from '../../component/header/header.component';
import { WishListComponent as WishListContentComponent } from '../../component/wish-list/wish-list.component';
@Component({
  selector: 'app-wish-list-route',
  standalone: true,
  imports: [WishListContentComponent, HeaderComponent, FooterComponent],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.css',
})
export class WishListComponent {}
