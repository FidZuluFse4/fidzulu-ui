import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { OrderHistoryService } from './order-history.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Orders } from '../models/orders.model';

describe('OrderHistoryService', () => {
  let service: OrderHistoryService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrderHistoryService, { provide: AuthService, useValue: spy }],
    });

    service = TestBed.inject(OrderHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get order history for authenticated user', () => {
    const userId = '123';
    const mockOrders: Orders[] = [
      {
        orders_id: 'ord1',
        user_id: 123,
        address: {
          location: 'Home',
          full_addr: '123 Main St',
        },
        order_list: [],
        total_amount: 199.99,
      },
    ];

    authServiceSpy.getCurrentUser.and.returnValue({
      user_id: userId,
      auth_token: 'token123',
    });

    service.getOrderHistory().subscribe((orders) => {
      expect(orders).toEqual(mockOrders);
    });

    const req = httpMock.expectOne(
      `${environment.lambda_1}/api/order/history/${userId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockOrders);
  });

  it('should return error when user is not authenticated', () => {
    authServiceSpy.getCurrentUser.and.returnValue({
      user_id: null,
      auth_token: null,
    });

    service.getOrderHistory().subscribe({
      next: () => fail('should have failed with an error'),
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.message).toContain('User not authenticated');
      },
    });
  });

  it('should get order by ID for authenticated user', () => {
    const userId = '123';
    const orderId = 'ord1';
    const mockOrder: Orders = {
      orders_id: orderId,
      user_id: 123,
      address: {
        location: 'Home',
        full_addr: '123 Main St',
      },
      order_list: [],
      total_amount: 199.99,
    };

    authServiceSpy.getCurrentUser.and.returnValue({
      user_id: userId,
      auth_token: 'token123',
    });

    service.getOrderById(orderId).subscribe((order) => {
      expect(order).toEqual(mockOrder);
    });

    const req = httpMock.expectOne(
      `${environment.lambda_1}/api/order/history/${userId}/${orderId}`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockOrder);
  });

  it('should handle http errors properly', () => {
    const userId = '123';
    const errorMessage = 'Server error';

    authServiceSpy.getCurrentUser.and.returnValue({
      user_id: userId,
      auth_token: 'token123',
    });

    service.getOrderHistory().subscribe({
      next: () => fail('should have failed with the server error'),
      error: (error) => {
        expect(error).toBeTruthy();
        expect(error.message).toContain('Error Code:');
      },
    });

    const req = httpMock.expectOne(
      `${environment.lambda_1}/api/order/history/${userId}`
    );
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});
