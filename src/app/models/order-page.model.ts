import { Order } from './order.model';

// DTO used only for page display (extra derived fields without polluting core Order interface)
export interface OrderPage extends Order {
  category?: string; // derived from product subtype or type
}
