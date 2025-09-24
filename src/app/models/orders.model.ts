import { Order } from './order.model';
import { Address } from './address.model';

export interface Orders {
  orders_id: string;
  user_id: number;
  address: Address;
  order_list: Order[];
  total_amount: number;
}
