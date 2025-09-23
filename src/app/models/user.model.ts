import { Product } from './product.model';
import { Address } from './address.model';
import { Order } from './order.model';

export interface User {
  id: number;
  name: string;
  username: string;
  password: string;
  address: Address[];
  wishList: Product[];
  cart: Order[];
}
