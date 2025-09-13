# 🚀 Swagger/OpenAPI Beginner's Guide for WMS

## 📋 What is Swagger?

**Swagger** (now called **OpenAPI**) is a powerful tool that automatically generates interactive documentation for your REST API. Think of it as a **living manual** for your API that:

- 📖 **Documents** all your API endpoints automatically
- 🧪 **Tests** your API directly from the browser
- 🔧 **Generates** TypeScript types for frontend development
- 📊 **Validates** API requests and responses
- 🤝 **Standardizes** API communication across your team

---

## 🎯 How Swagger Works in Your WMS Project

### **The Magic Flow:**
```
1. You write code comments → 2. Swagger reads comments → 3. Generates documentation → 4. Creates TypeScript types
```

### **What You Get:**
- **Interactive Web UI** at `http://localhost:8003/api-docs`
- **Type-safe frontend code** with auto-completion
- **Automatic API testing** without writing test scripts
- **Professional documentation** for your entire team

---

## 🌐 Accessing Your WMS Swagger Documentation

### **1. Start Your Backend Server**
```bash
cd backend
PORT=8003 npm run dev
```

### **2. Open Swagger UI in Your Browser**
Visit: **http://localhost:8003/api-docs**

You'll see a beautiful, interactive API documentation page with all 49 endpoints!

### **3. Explore the Documentation**
- 📂 **Endpoints are grouped by module** (Authentication, Users, Products, etc.)
- 🔍 **Click any endpoint** to see detailed information
- 📝 **View request/response examples** with real data
- 🧪 **Test endpoints directly** from the browser

---

## 🧪 How to Test Your API with Swagger UI

### **Step 1: Authentication**
Most endpoints require authentication. Here's how to authenticate:

1. **Find the Login endpoint**: Look for `POST /api/auth/login`
2. **Click "Try it out"**
3. **Enter test credentials**:
   ```json
   {
     "email": "admin@wms.com",
     "password": "admin123"
   }
   ```
4. **Click "Execute"**
5. **Copy the token** from the response
6. **Click the "Authorize" button** at the top of the page
7. **Enter**: `Bearer YOUR_TOKEN_HERE`
8. **Click "Authorize"**

### **Step 2: Test Any Endpoint**
Now you can test any protected endpoint:

1. **Choose an endpoint** (e.g., `GET /api/users`)
2. **Click "Try it out"**
3. **Fill in any required parameters**
4. **Click "Execute"**
5. **See the real response** from your API!

---

## 📊 Understanding the Documentation Structure

### **Endpoint Information**
Each endpoint shows you:

```yaml
GET /api/users                    # HTTP method and URL
Tags: [Users]                     # Which module it belongs to
Summary: Get all users            # Brief description
Description: Retrieve a paginated list of users with optional filtering
Security: bearerAuth required     # Authentication needed
Parameters:                       # What you can send
  - page: integer (optional)
  - limit: integer (optional)
  - search: string (optional)
Responses:                        # What you get back
  200: Success with user list
  401: Unauthorized
  500: Server error
```

### **Schema Definitions**
Click on any schema to see the data structure:

```typescript
User {
  id: string              // "123"
  email: string           // "john@example.com"
  firstName: string       // "John"
  lastName: string        // "Doe"
  isActive: boolean       // true
  createdAt: string       // "2024-01-15T10:30:00Z"
  // ... more fields
}
```

---

## 🔧 Using Generated TypeScript Types

### **Installation in Frontend**
Your TypeScript types are automatically generated! Use them like this:

```typescript
// Import the generated types
import { apiClient, User, CreateUserRequest } from '@my-app/shared/types/api';

// Set authentication token
apiClient.setAuthToken('your-jwt-token-here');

// Make type-safe API calls
const users: User[] = await apiClient.getUsers({
  page: 1,
  limit: 10,
  search: 'john'
});

// Create a new user with full type safety
const newUser: User = await apiClient.createUser({
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Smith',
  username: 'janesmith',
  password: 'securepassword123'
  // TypeScript will warn you if you miss required fields!
});
```

### **Benefits of Type Safety**
- ✅ **Auto-completion** in your IDE
- ✅ **Compile-time error checking**
- ✅ **Consistent data structures**
- ✅ **Reduced bugs** from typos or wrong data types

---

## 📱 Common Use Cases

### **1. Frontend Development**
```typescript
// Before Swagger (manual, error-prone)
const response = await fetch('/api/users');
const users = await response.json(); // No type safety!

// After Swagger (type-safe, auto-complete)
const users = await apiClient.getUsers(); // Fully typed!
```

### **2. API Testing**
Instead of using Postman or curl, test directly in Swagger UI:
- No need to remember URLs or parameters
- Authentication is handled automatically
- See real responses instantly

### **3. Team Communication**
- **Backend developers** document APIs as they code
- **Frontend developers** see exactly what's available
- **QA engineers** understand expected behavior
- **Product managers** see what the API can do

### **4. Debugging**
When something goes wrong:
1. Check the Swagger documentation for expected format
2. Test the endpoint directly in Swagger UI
3. Compare your request with the documented examples
4. Verify authentication and required fields

---

## 📖 Reading Swagger Documentation

### **Understanding HTTP Methods**
- **GET**: Retrieve data (e.g., get list of users)
- **POST**: Create new data (e.g., create a new user)
- **PUT**: Update existing data (e.g., update user info)
- **DELETE**: Remove data (e.g., delete a user)
- **PATCH**: Partially update data (e.g., update only user email)

### **Understanding Response Codes**
- **200**: Success - everything worked
- **201**: Created - new resource was created successfully
- **400**: Bad Request - you sent invalid data
- **401**: Unauthorized - you need to login/authenticate
- **403**: Forbidden - you don't have permission
- **404**: Not Found - the resource doesn't exist
- **500**: Server Error - something went wrong on our side

### **Understanding Parameters**
- **Path Parameters**: `{id}` in the URL (e.g., `/api/users/{id}`)
- **Query Parameters**: `?page=1&limit=10` at the end of URL
- **Body Parameters**: JSON data sent in the request body

---

## 🎨 Exploring Your WMS API

### **Authentication Module** 🔐
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/register` - Create new account

### **User Management** 👥
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/{id}` - Get specific user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/avatar` - Upload user avatar
- `PUT /api/users/{id}/password` - Change user password

### **Product Management** 📦
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/{id}` - Get specific product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### **Organization** 📂
- **Categories**: `/api/categories` - Product categories
- **Brands**: `/api/brands` - Product brands
- **Families**: `/api/families` - Product families
- **Units**: `/api/units` - Measurement units

### **Advanced Features** ⚙️
- **Attributes**: `/api/attributes` - Product attributes
- **Attribute Options**: `/api/attribute-options` - Attribute choices
- **Attribute Values**: `/api/attribute-values` - Product attribute values
- **Profile**: `/api/profile` - User profile management

---

## 🛠️ Practical Examples

### **Example 1: Get All Products**
1. Go to `GET /api/products`
2. Click "Try it out"
3. Optionally add query parameters:
   - `page`: 1
   - `limit`: 10
   - `search`: "coffee"
4. Click "Execute"
5. See the response with product list!

### **Example 2: Create a New Category**
1. Make sure you're authenticated (see authentication steps above)
2. Go to `POST /api/categories`
3. Click "Try it out"
4. Enter request body:
   ```json
   {
     "name": "Electronics",
     "description": "Electronic devices and accessories",
     "isActive": true
   }
   ```
5. Click "Execute"
6. See the newly created category in the response!

### **Example 3: Upload a Profile Picture**
1. Go to `POST /api/profile/avatar`
2. Click "Try it out"
3. Choose a file (JPEG or PNG, max 5MB)
4. Click "Execute"
5. See the uploaded avatar URL in the response!

---

## ⚡ Quick Tips for Beginners

### **DO's** ✅
- **Always authenticate first** before testing protected endpoints
- **Read the description** of each endpoint to understand what it does
- **Check the examples** to see the expected data format
- **Use the "Try it out" feature** instead of external tools
- **Look at response schemas** to understand the data structure

### **DON'Ts** ❌
- **Don't skip authentication** - most endpoints require it
- **Don't ignore error responses** - they tell you what went wrong
- **Don't use made-up data** - follow the examples provided
- **Don't forget required fields** - marked with red asterisks (*)

### **Troubleshooting** 🔧
- **401 Unauthorized**: You need to authenticate first
- **400 Bad Request**: Check your request format against the examples
- **404 Not Found**: Make sure the endpoint URL is correct
- **500 Server Error**: Something's wrong with the server - check logs

---

## 🚀 Next Steps

### **For Frontend Developers**
1. **Install the generated types** in your frontend project
2. **Use the API client** for type-safe API calls
3. **Refer to Swagger docs** when implementing new features
4. **Test your integration** using Swagger UI

### **For Backend Developers**
1. **Keep documentation updated** when you change APIs
2. **Add realistic examples** to help frontend developers
3. **Document all error cases** to help with debugging
4. **Test your own endpoints** using Swagger UI

### **For QA Engineers**
1. **Use Swagger UI for manual testing** instead of external tools
2. **Verify all documented endpoints work** as described
3. **Test edge cases** and error scenarios
4. **Validate response formats** match the documentation

### **For Project Managers**
1. **Review API capabilities** to understand what's possible
2. **Use documentation for planning** new features
3. **Share Swagger URL** with stakeholders for transparency
4. **Track API coverage** to ensure completeness

---

## 🎯 Summary

Swagger transforms your WMS API from a black box into a transparent, testable, and well-documented system. With Swagger, you can:

- **📖 Understand** exactly what each API endpoint does
- **🧪 Test** your API without writing any code
- **🔧 Develop** faster with type-safe frontend integration
- **🤝 Collaborate** better with clear, consistent documentation
- **🐛 Debug** issues more efficiently with clear examples

**Your WMS project now has world-class API documentation with all 49 endpoints fully documented and ready to use!**

Visit **http://localhost:8003/api-docs** and start exploring your API today! 🚀

---

*This guide covers everything you need to know to start using Swagger effectively in your WMS project. Happy coding! 🎉*