# 👤 User Management API Endpoints (`/api/v1/users`)

This document provides step-by-step usage instructions for managing user accounts, updating user details, assigning system roles, and deleting users.

---

## 1. GET `/api/v1/users` (List Users)

Retrieves a paginated list of all registered users with their assigned roles.

- **URL Path**: `/api/v1/users`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `USER_READ`

### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `skip` | `int` | No | `0` | Number of records to skip for pagination |
| `limit` | `int` | No | `100` | Maximum number of records to return |

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/users?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Users list retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "username": "admin",
      "full_name": "System Administrator",
      "is_active": true,
      "roles": [
        {
          "id": 1,
          "name": "SuperAdmin",
          "code": "ROLE_SUPERADMIN",
          "description": "Full access to all system resources"
        }
      ],
      "created_at": "2026-09-05T08:50:00",
      "updated_at": "2026-09-05T08:50:00"
    }
  ]
}
```

---

## 2. POST `/api/v1/users` (Create User)

Creates a new user account and assigns initial roles.

- **URL Path**: `/api/v1/users`
- **HTTP Method**: `POST`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `USER_CREATE`

### Request Body (JSON)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Unique email address |
| `username` | `string` | Yes | Unique username |
| `full_name` | `string` | No | User's display name |
| `password` | `string` | Yes | Plaintext password (must satisfy complexity rules) |
| `is_active` | `boolean` | No | Active account status (Default `true`) |
| `role_ids` | `array[int]` | No | Array of Role IDs to assign |

```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "password": "Password123!",
  "is_active": true,
  "role_ids": [2]
}
```

### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/users" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "password": "Password123!",
    "is_active": true,
    "role_ids": [2]
  }'
```

### Success Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "email": "john.doe@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "is_active": true,
    "roles": [
      {
        "id": 2,
        "name": "Standard User",
        "code": "ROLE_USER",
        "description": "Standard user access"
      }
    ],
    "created_at": "2026-09-05T09:00:00",
    "updated_at": "2026-09-05T09:00:00"
  }
}
```

---

## 3. GET `/api/v1/users/{user_id}` (Get User Details)

Retrieves full details of a specific user by ID.

- **URL Path**: `/api/v1/users/{user_id}`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `USER_READ`

---

## 4. PUT `/api/v1/users/{user_id}` (Update User & Roles)

Updates user profile fields, password, active status, or assigned roles.

- **URL Path**: `/api/v1/users/{user_id}`
- **HTTP Method**: `PUT`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `USER_UPDATE`

### Request Body (JSON)
```json
{
  "full_name": "Johnathan Doe",
  "is_active": true,
  "role_ids": [1, 2]
}
```

---

## 5. POST `/api/v1/users/{user_id}/roles` (Assign Roles to User)

Assigns or replaces roles directly for a specific user account.

- **URL Path**: `/api/v1/users/{user_id}/roles`
- **HTTP Method**: `POST`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `USER_UPDATE`

### Request Body (JSON)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `role_ids` | `array[int]` | Yes | List of Role IDs to assign to the target user |

```json
{
  "role_ids": [2, 3]
}
```

### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/users/2/roles" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": [2, 3]
  }'
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Roles assigned to user successfully",
  "data": {
    "id": 2,
    "email": "john.doe@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "is_active": true,
    "roles": [
      {
        "id": 2,
        "name": "Admin",
        "code": "ROLE_ADMIN",
        "description": "Full administrative permissions"
      },
      {
        "id": 3,
        "name": "Standard User",
        "code": "ROLE_USER",
        "description": "Basic user access with Dashboard view"
      }
    ],
    "created_at": "2026-09-05T09:00:00",
    "updated_at": "2026-09-05T09:05:00"
  }
}
```

---

## 6. DELETE `/api/v1/users/{user_id}` (Delete User)

Deletes a user account. Safety check prevents a user from deleting their own currently logged-in account.

- **URL Path**: `/api/v1/users/{user_id}`
- **HTTP Method**: `DELETE`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `USER_DELETE`

