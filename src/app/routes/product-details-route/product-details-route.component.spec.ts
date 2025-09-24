import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsRouteComponent } from './product-details-route.component';

describe('ProductDetailsRouteComponent', () => {
  let component: ProductDetailsRouteComponent;
  let fixture: ComponentFixture<ProductDetailsRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsRouteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
