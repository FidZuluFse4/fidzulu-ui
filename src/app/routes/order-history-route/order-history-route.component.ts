import { Component } from '@angular/core';
import { HeaderComponent } from '../../component/header/header.component';
import { FooterComponent } from '../../component/footer/footer.component';
import { OrderHistoryComponent } from '../../component/order-history/order-history.component';

@Component({
  selector: 'app-order-history-route',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, OrderHistoryComponent],
  templateUrl: './order-history-route.component.html',
  styleUrl: './order-history-route.component.css',
})
export class OrderHistoryRouteComponent {}
