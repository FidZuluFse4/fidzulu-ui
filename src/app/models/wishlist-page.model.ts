import { Product } from './product.model';

// Display DTO for wishlist items (kept separate so core Product stays clean)
export interface WishlistPage extends Product {
  category?: string; // derived from subtype/type
}
