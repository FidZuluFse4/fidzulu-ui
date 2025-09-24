# Fidzulu Application API Documentation

## AuthController

| Method | Endpoint          | Description         | Sample JSON Body                |
|--------|------------------|---------------------|---------------------------------|
| POST   | `/auth/login`    | User login          | `{ "email": "user@example.com", "password": "yourPassword" }` |
| POST   | `/auth/register` | User registration   | `{ "email": "user@example.com", "password": "yourPassword", "name": "John Doe" }` |
| POST   | `/auth/logout`   | User logout         | _No body_                       |

## GlobalExceptionHandler

Handles application-wide exceptions. No direct endpoints.

## OrderController

| Method | Endpoint           | Description        | Sample JSON Body                |
|--------|-------------------|--------------------|---------------------------------|
| GET    | `/orders`         | Get all orders     | _No body_                       |
| GET    | `/orders/{id}`    | Get order by ID    | _No body_                       |
| POST   | `/orders`         | Create a new order | `{ "userId": 1, "items": [{ "productId": 101, "quantity": 2 }], "shippingAddressId": 5 }` |
| PUT    | `/orders/{id}`    | Update an order    | `{ "status": "SHIPPED" }`       |
| DELETE | `/orders/{id}`    | Delete an order    | _No body_                       |

## UserAddressController

| Method | Endpoint                 | Description        | Sample JSON Body                |
|--------|-------------------------|--------------------|---------------------------------|
| GET    | `/user/addresses`       | Get all addresses  | _No body_                       |
| GET    | `/user/addresses/{id}`  | Get address by ID  | _No body_                       |
| POST   | `/user/addresses`       | Add new address    | `{ "street": "123 Main St", "city": "Lusaka", "zip": "10101", "country": "Zambia" }` |
| PUT    | `/user/addresses/{id}`  | Update address     | `{ "street": "456 New Ave", "city": "Kitwe", "zip": "10102", "country": "Zambia" }` |
| DELETE | `/user/addresses/{id}`  | Delete address     | _No body_                       |

## WishlistController

| Method | Endpoint                | Description            | Sample JSON Body                |
|--------|------------------------|------------------------|---------------------------------|
| GET    | `/wishlist`            | Get wishlist items     | _No body_                       |
| POST   | `/wishlist`            | Add item to wishlist   | `{ "productId": 101 }`          |
| DELETE | `/wishlist/{itemId}`   | Remove item from wishlist | _No body_                   |

---

**Note:**
- Replace `{id}` and `{itemId}` with actual resource IDs.
- Adjust sample JSON to match your actual request DTOs.
