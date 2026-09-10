# 🛡️ Role Management API Endpoints (`/api/v1/roles`)

This document provides step-by-step usage instructions for managing system roles and mapping permissions to roles.

---

## 1. GET `/api/v1/roles` (List Roles)

Retrieves all roles along with their assigned permissions.

- **URL Path**: `/api/v1/roles`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `ROLE_READ`

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/roles" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Roles list retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "SuperAdmin",
      "code": "ROLE_SUPERADMIN",
      "description": "Full access to all system resources",
      "permissions": [ ... ],
      "created_at": "2026-09-05T08:50:00",
      "updated_at": "2026-09-05T08:50:00"
    }
  ]
}
```

---

## 2. POST `/api/v1/roles` (Create Role)

Creates a new system role and optionally assigns initial permission IDs.

- **URL Path**: `/api/v1/roles`
- **HTTP Method**: `POST`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `ROLE_CREATE`

### Request Body (JSON)
```json
{
  "name": "Content Manager",
  "code": "ROLE_CONTENT_MANAGER",
  "description": "Can edit and publish content",
  "permission_ids": [1, 3, 5]
}
```

### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/roles" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Content Manager",
    "code": "ROLE_CONTENT_MANAGER",
    "description": "Can edit and publish content",
    "permission_ids": [1, 3, 5]
  }'
```

### Success Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "id": 4,
    "name": "Content Manager",
    "code": "ROLE_CONTENT_MANAGER",
    "description": "Can edit and publish content",
    "permissions": [ ... ],
    "created_at": "2026-09-05T09:05:00",
    "updated_at": "2026-09-05T09:05:00"
  }
}
```

---

## 3. GET `/api/v1/roles/{role_id}` (Get Role Details)

Retrieves details of a specific role by ID.

- **URL Path**: `/api/v1/roles/{role_id}`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `ROLE_READ`

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/roles/4" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Role details retrieved successfully",
  "data": {
    "id": 4,
    "name": "Content Manager",
    "code": "ROLE_CONTENT_MANAGER",
    "description": "Can edit and publish content",
    "permissions": [ ... ]
  }
}
```

---

## 4. PUT `/api/v1/roles/{role_id}` (Update Role)

Updates role information, code, or assigned permissions.

- **URL Path**: `/api/v1/roles/{role_id}`
- **HTTP Method**: `PUT`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `ROLE_UPDATE`

### Request Body (JSON)
```json
{
  "name": "Senior Content Manager",
  "description": "Updated privileges for senior manager",
  "permission_ids": [1, 2, 3, 4, 5]
}
```

### cURL Example
```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/roles/4" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Content Manager",
    "permission_ids": [1, 2, 3, 4, 5]
  }'
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": 4,
    "name": "Senior Content Manager",
    "code": "ROLE_CONTENT_MANAGER",
    "permissions": [ ... ]
  }
}
```

---

## 5. DELETE `/api/v1/roles/{role_id}` (Delete Role)

Deletes a system role.

- **URL Path**: `/api/v1/roles/{role_id}`
- **HTTP Method**: `DELETE`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `ROLE_DELETE`

### cURL Example
```bash
curl -X DELETE "http://127.0.0.1:8000/api/v1/roles/4" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Role deleted successfully",
  "data": null
}
```

---

## 6. POST `/api/v1/roles/{role_id}/permissions` (Batch Assign Permissions)

Batch assigns/replaces permissions assigned to a specific role.

- **URL Path**: `/api/v1/roles/{role_id}/permissions`
- **HTTP Method**: `POST`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `ROLE_UPDATE`

### Request Body (JSON)
```json
{
  "permission_ids": [1, 2, 3, 7, 8]
}
```

### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/roles/4/permissions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [1, 2, 3, 7, 8]
  }'
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Permissions assigned to role successfully",
  "data": {
    "id": 4,
    "name": "Senior Content Manager",
    "code": "ROLE_CONTENT_MANAGER",
    "permissions": [ ... ]
  }
}
```
