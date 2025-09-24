export interface Product {
  p_id: number;
  p_type: string;
  p_subtype: string;
  p_name: string;
  p_desc: string;
  p_price: number;
  p_currency: String, 
  p_img_url: string;
  attribute: Record<string, string>;
  p_quantity: number;
}
