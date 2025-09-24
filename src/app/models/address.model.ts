export interface Address {
  id?: string; // Unique identifier
  location: string; // Country/Location name (India, Ireland, USA)
  full_addr: string; // Complete address (comma-separated values)
  isDefault?: boolean; // Whether this is the default address
}
