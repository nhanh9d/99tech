# Problem 5: Express.js CRUD API with TypeScript

A RESTful API service built with Express.js and TypeScript that provides CRUD operations for managing resources.

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ SQLite database for data persistence
- ✅ TypeScript for type safety
- ✅ Input validation
- ✅ Error handling middleware
- ✅ Filtering and pagination support
- ✅ Security headers with Helmet
- ✅ CORS enabled
- ✅ Request logging with Morgan

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the project root directory:
```bash
cd /path/to/99tech
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Create data directory for SQLite database:
```bash
mkdir -p data
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on port 3000 by default (or the PORT environment variable if set).

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```

### Resource Endpoints

#### 1. Create a Resource
```
POST /api/resources
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "This is a sample product",
  "category": "Electronics",
  "price": 99.99,
  "quantity": 10
}
```

#### 2. List Resources with Filters
```
GET /api/resources?name=sample&category=Electronics&min_price=10&max_price=100&limit=10&offset=0
```

Query Parameters:
- `name` - Filter by name (partial match)
- `category` - Filter by exact category
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `limit` - Number of records to return (default: 50)
- `offset` - Number of records to skip for pagination

#### 3. Get Resource Details
```
GET /api/resources/:id
```

#### 4. Update Resource
```
PUT /api/resources/:id
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 149.99,
  "quantity": 5
}
```

Note: All fields are optional in update requests.

#### 5. Delete Resource
```
DELETE /api/resources/:id
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "errors": ["Array of validation errors if applicable"]
}
```

## Database Schema

The `resources` table has the following structure:

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| name | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| price | REAL | NOT NULL, CHECK(price >= 0) |
| quantity | INTEGER | NOT NULL, CHECK(quantity >= 0) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## Testing

Run the tests with:
```bash
npm test -- tests/problem5/
```

## Example Usage

### Create a new resource
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "category": "Electronics",
    "price": 999.99,
    "quantity": 5
  }'
```

### Get all resources
```bash
curl http://localhost:3000/api/resources
```

### Get resources with filters
```bash
curl "http://localhost:3000/api/resources?category=Electronics&min_price=100&max_price=1000"
```

### Update a resource
```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 899.99,
    "quantity": 3
  }'
```

### Delete a resource
```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

## Error Handling

The API includes comprehensive error handling:
- 400 Bad Request - Invalid input or validation errors
- 404 Not Found - Resource not found
- 500 Internal Server Error - Server errors

## Security

- Helmet.js for security headers
- Input validation on all endpoints
- SQL injection protection through parameterized queries
- CORS configuration for cross-origin requests