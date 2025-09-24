import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

class MockProductService {
  // expose a productsSubject mimic with some products
  productsSubject = new BehaviorSubject<Product[]>([
    {
      p_id: 'p1',
      p_type: 'Bike',
      p_name: 'Road Bike',
      p_price: 150,
      p_currency: '$',
      p_img_url: 'img1.jpg',
      attribute: {},
      p_quantity: 0,
    } as any,
    {
      p_id: 'p2',
      p_type: 'Bike',
      p_name: 'City Bike',
      p_price: 90,
      p_currency: '$',
      p_img_url: 'img2.jpg',
      attribute: {},
      p_quantity: 0,
    } as any,
  ]);
}

describe('UserService', () => {
  let service: UserService;
  let productService: MockProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: ProductService, useClass: MockProductService }],
    });
    service = TestBed.inject(UserService);
    productService = TestBed.inject(ProductService) as any;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add to wishlist and emit', (done) => {
    service.wishlist$.subscribe((list) => {
      if (list.length) {
        expect(list[0].p_id).toBe('p1');
        done();
      }
    });
    // toggle add
    service.toggleWishlist(productService.productsSubject.value[0]).subscribe();
  });

  it('should remove from wishlist when toggled twice', (done) => {
    let emissionCount = 0;
    service.toggleWishlist(productService.productsSubject.value[0]).subscribe();
    service.wishlist$.subscribe((list) => {
      emissionCount++;
      if (emissionCount === 1) {
        expect(list.length).toBe(1);
        // second toggle removes
        service
          .toggleWishlist(productService.productsSubject.value[0])
          .subscribe();
      } else if (emissionCount === 2) {
        expect(list.length).toBe(0);
        done();
      }
    });
  });

  it('should add to cart and update quantity/amount when re-adding', (done) => {
    let step = 0;
    service.cart$.subscribe((cart) => {
      if (step === 0) {
        // initial emission (empty) skip
        step++;
        service.addToCart('p1', 2).subscribe();
      } else if (step === 1) {
        expect(cart.length).toBe(1);
        expect(cart[0].amount).toBe(300); // 150 * 2
        step++;
        service.addToCart('p1', 5).subscribe();
      } else if (step === 2) {
        expect(cart[0].quantity).toBe(5);
        expect(cart[0].amount).toBe(750); // updated
        done();
      }
    });
  });

  it('should remove from cart', (done) => {
    service.addToCart('p2', 1).subscribe(() => {
      const orderId = (service as any).mockUser.cart[0].o_id;
      let emission = 0;
      service.cart$.subscribe((cart) => {
        emission++;
        if (emission === 1) {
          // After addToCart subscription, first emission we see should contain the item
          expect(cart.length).toBe(1);
          expect(cart[0].p_id).toBe('p2');
          service.removeFromCart(orderId).subscribe();
        } else if (emission === 2) {
          // After removal we expect an empty cart
          expect(cart.length).toBe(0);
          done();
        }
      });
    });
  });

  it('should clear cart on checkout', (done) => {
    service.addToCart('p1', 1).subscribe(() => {
      service.checkoutCart().subscribe(() => {
        service.cart$.subscribe((cart) => {
          expect(cart.length).toBe(0);
          done();
        });
      });
    });
  });
});
