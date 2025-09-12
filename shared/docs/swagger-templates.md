# Swagger Documentation Templates

## 🎯 Overview
This document provides standardized templates for documenting API endpoints in the WMS system. Use these templates to ensure consistency across all route documentation.

---

## 📝 Basic Route Template

### GET Endpoint (List/Read)
```typescript
/**
 * @swagger
 * /api/{resource}:
 *   get:
 *     tags: [{ResourceName}]
 *     summary: Get all {resource}
 *     description: Retrieve a paginated list of {resource} with optional filtering and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter results
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: {Resource} retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     {resource}:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/{ResourceName}'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                 message:
 *                   type: string
 *                   example: {Resource} retrieved successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

### GET by ID Endpoint
```typescript
/**
 * @swagger
 * /api/{resource}/{id}:
 *   get:
 *     tags: [{ResourceName}]
 *     summary: Get {resource} by ID
 *     description: Retrieve a specific {resource} by its unique identifier
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {Resource} unique identifier
 *         example: "123"
 *     responses:
 *       200:
 *         description: {Resource} retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     {resource}:
 *                       $ref: '#/components/schemas/{ResourceName}'
 *                 message:
 *                   type: string
 *                   example: {Resource} retrieved successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

### POST Endpoint (Create)
```typescript
/**
 * @swagger
 * /api/{resource}:
 *   post:
 *     tags: [{ResourceName}]
 *     summary: Create new {resource}
 *     description: Create a new {resource} with the provided information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Create{ResourceName}Request'
 *     responses:
 *       201:
 *         description: {Resource} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     {resource}:
 *                       $ref: '#/components/schemas/{ResourceName}'
 *                 message:
 *                   type: string
 *                   example: {Resource} created successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: Conflict - {Resource} already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: {Resource} with this name already exists
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

### PUT Endpoint (Update)
```typescript
/**
 * @swagger
 * /api/{resource}/{id}:
 *   put:
 *     tags: [{ResourceName}]
 *     summary: Update {resource}
 *     description: Update an existing {resource} with new information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {Resource} unique identifier
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Update{ResourceName}Request'
 *     responses:
 *       200:
 *         description: {Resource} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     {resource}:
 *                       $ref: '#/components/schemas/{ResourceName}'
 *                 message:
 *                   type: string
 *                   example: {Resource} updated successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

### DELETE Endpoint
```typescript
/**
 * @swagger
 * /api/{resource}/{id}:
 *   delete:
 *     tags: [{ResourceName}]
 *     summary: Delete {resource}
 *     description: Soft delete a {resource} by setting its deleted_at timestamp
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {Resource} unique identifier
 *         example: "123"
 *     responses:
 *       200:
 *         description: {Resource} deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: {Resource} deleted successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

---

## 🗂️ Schema Templates

### Basic Entity Schema
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     {ResourceName}:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "123"
 *         name:
 *           type: string
 *           description: {Resource} name
 *           example: "Sample Name"
 *         description:
 *           type: string
 *           nullable: true
 *           description: {Resource} description
 *           example: "This is a sample description"
 *         isActive:
 *           type: boolean
 *           description: Whether the {resource} is active
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *           example: "2023-01-01T12:00:00Z"
 */
```

### Create Request Schema
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Create{ResourceName}Request:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: {Resource} name
 *           example: "New {Resource}"
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 1000
 *           description: {Resource} description
 *           example: "Description of the new {resource}"
 *         isActive:
 *           type: boolean
 *           description: Whether the {resource} should be active
 *           default: true
 *           example: true
 */
```

### Update Request Schema
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Update{ResourceName}Request:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: {Resource} name
 *           example: "Updated {Resource}"
 *         description:
 *           type: string
 *           nullable: true
 *           maxLength: 1000
 *           description: {Resource} description
 *           example: "Updated description"
 *         isActive:
 *           type: boolean
 *           description: Whether the {resource} is active
 *           example: true
 */
```

### List Response Schema
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     {ResourceName}ListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             {resource}:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/{ResourceName}'
 *             pagination:
 *               $ref: '#/components/schemas/PaginationInfo'
 *         message:
 *           type: string
 *           example: {Resource} retrieved successfully
 */
```

### Pagination Schema
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Items per page
 *           example: 10
 *         total:
 *           type: integer
 *           description: Total number of items
 *           example: 100
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 10
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there is a next page
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           description: Whether there is a previous page
 *           example: false
 */
```

---

## 📎 File Upload Template

```typescript
/**
 * @swagger
 * /api/{resource}/{id}/upload:
 *   post:
 *     tags: [{ResourceName}]
 *     summary: Upload file for {resource}
 *     description: Upload a file (image, document) associated with the {resource}
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: {Resource} unique identifier
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (max 5MB)
 *               description:
 *                 type: string
 *                 description: Optional file description
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                       description: URL of the uploaded file
 *                       example: "/uploads/{resource}/123/file-123.jpg"
 *                     fileName:
 *                       type: string
 *                       description: Name of the uploaded file
 *                       example: "file-123.jpg"
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       413:
 *         description: File too large
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               data: null
 *               message: File size exceeds maximum limit of 5MB
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

---

## 🔍 Search/Filter Template

```typescript
/**
 * @swagger
 * /api/{resource}/search:
 *   get:
 *     tags: [{ResourceName}]
 *     summary: Search {resource}
 *     description: Advanced search with multiple filters and sorting options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query across multiple fields
 *         example: "search term"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: all
 *         description: Filter by status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (ISO format)
 *         example: "2023-01-01"
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (ISO format)
 *         example: "2023-12-31"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/{ResourceName}ListResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

---

## 🎲 Usage Examples

### Real Implementation Example: Users Module

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - username
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           description: User unique identifier
 *           example: "123"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "john.doe@example.com"
 *         username:
 *           type: string
 *           description: Unique username
 *           example: "johndoe"
 *         firstName:
 *           type: string
 *           description: User first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           description: User last name
 *           example: "Doe"
 *         phone:
 *           type: string
 *           nullable: true
 *           description: User phone number
 *           example: "+1234567890"
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *           description: User avatar image URL
 *           example: "/uploads/avatars/avatar-123.jpg"
 *         isActive:
 *           type: boolean
 *           description: User account status
 *           example: true
 *         roleNames:
 *           type: array
 *           items:
 *             type: string
 *           description: User roles
 *           example: ["admin", "manager"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation date
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date
 *           example: "2023-01-01T12:00:00Z"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Retrieve a paginated list of users with optional filtering and sorting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PaginationPage'
 *       - $ref: '#/components/parameters/PaginationLimit'
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in username, email, firstName, lastName
 *         example: "john"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role
 *         example: "admin"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: all
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                 message:
 *                   type: string
 *                   example: Users retrieved successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

---

## 📋 Implementation Checklist

For each endpoint, ensure:

### Documentation Requirements:
- [ ] Route summary and description
- [ ] Correct HTTP method and path
- [ ] Proper tags for grouping
- [ ] Security requirements (bearerAuth)
- [ ] All parameters with types and examples
- [ ] Request body schema (for POST/PUT)
- [ ] All possible response codes
- [ ] Response schemas with examples
- [ ] Error handling documentation

### Schema Requirements:
- [ ] Complete entity schema
- [ ] Create request schema
- [ ] Update request schema
- [ ] Response wrapper schemas
- [ ] Validation rules (min/max, required fields)
- [ ] Proper field descriptions
- [ ] Realistic examples

### Quality Assurance:
- [ ] Swagger UI renders correctly
- [ ] All examples are valid
- [ ] TypeScript types compile
- [ ] No schema validation errors
- [ ] Consistent naming conventions
- [ ] Complete error coverage

Use these templates as starting points and customize them for your specific endpoints and business logic.