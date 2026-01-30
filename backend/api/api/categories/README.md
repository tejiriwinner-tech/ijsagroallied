# Category API Endpoints

## List Categories

**Endpoint:** `GET /api/api/categories/list.php`

**Authentication:** Required (Admin only)

**Description:** Returns all categories with their subcategories in a hierarchical structure.

### Request

**Headers:**
```
Authorization: Bearer {token}
```

**Method:** GET

**Parameters:** None

### Response

**Success (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-123",
      "name": "Category Name",
      "slug": "category-slug",
      "description": "Category description",
      "image": "/path/to/image.jpg",
      "subcategories": [
        {
          "id": "sub-456",
          "category_id": "cat-123",
          "name": "Subcategory Name",
          "slug": "subcategory-slug"
        }
      ]
    }
  ]
}
```

**Error Responses:**

**401 Unauthorized:**
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

**403 Forbidden:**
```json
{
  "error": "Admin access required",
  "code": "FORBIDDEN"
}
```

**405 Method Not Allowed:**
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "An error occurred while fetching categories"
}
```

### Testing

To test this endpoint, you need:

1. A valid admin user account
2. An authentication token (obtained from `/api/api/auth/login.php`)

**Example using cURL:**

```bash
# First, login to get a token
curl -X POST http://localhost/api/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ijs.com","password":"admin123"}'

# Use the token to access the category list
curl -X GET http://localhost/api/api/categories/list.php \
  -H "Authorization: Bearer {your-token-here}"
```

**Example using JavaScript (fetch):**

```javascript
// Assuming you have a token stored
const token = localStorage.getItem('authToken');

fetch('/api/api/categories/list.php', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Categories:', data.data);
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => console.error('Network error:', error));
```

### Implementation Details

- **Hierarchical Structure:** Each category includes a `subcategories` array containing all its child subcategories
- **Ordering:** Categories and subcategories are ordered alphabetically by name
- **Authentication:** Uses JWT token-based authentication via the `requireAdmin()` helper function
- **Error Handling:** All errors are logged server-side, but only generic messages are returned to the client
- **Database:** Uses prepared statements to prevent SQL injection

### Related Endpoints

- `GET /api/api/categories/index.php` - Public endpoint for fetching categories (no auth required)
- `POST /api/api/categories/create.php` - Create a new category (admin only, to be implemented)
- `PUT /api/api/categories/update.php` - Update a category (admin only, to be implemented)
- `DELETE /api/api/categories/delete.php` - Delete a category (admin only, to be implemented)
