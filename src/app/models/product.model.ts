export interface Product {
  // backend may return string ids like 'B3002' or numbers; accept both
  p_id: string;
  p_type: string;
  // backend sometimes uses p_sub_type (with underscore) — normalized to p_subtype
  p_subtype?: string;
  p_name: string;
  p_desc?: string;
  p_currency?: string;
  p_price: number;
  // normalized to single string (first image)
  p_img_url?: string;
  attribute?: Record<string, any>;
  p_quantity?: number;
}
