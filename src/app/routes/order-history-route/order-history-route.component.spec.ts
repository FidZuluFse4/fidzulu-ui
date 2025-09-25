import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderHistoryRouteComponent } from './order-history-route.component';

describe('OrderHistoryRouteComponent', () => {
  let component: OrderHistoryRouteComponent;
  let fixture: ComponentFixture<OrderHistoryRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderHistoryRouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderHistoryRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
