import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wish-list',
  standalone: true,
  imports: [CommonModule,MatCardModule,
    MatButtonModule,
    MatIconModule],
  templateUrl: './wish-list.component.html',
  styleUrl: './wish-list.component.css'
})

export class WishListComponent implements OnInit {
  wishlist: Product[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe(user => {
      this.wishlist = user.wishList;
    });
  }

  addToCart(product: Product) {
    const quantity = 1;
    this.userService.addToCart(product.p_id, quantity).subscribe(() => {
      alert(`${product.p_name} added to cart!`);
    });
  }

  removeFromWishlist(p_id: number) {
    this.userService.removeFromWishlist(p_id).subscribe(() => {
      this.wishlist = this.wishlist.filter(p => p.p_id !== p_id);
    });
  }
}
