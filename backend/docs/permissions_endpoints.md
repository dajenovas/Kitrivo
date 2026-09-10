# ⚡ Permission Management & Menu Tree API Endpoints (`/api/v1/permissions`)

This document provides step-by-step usage instructions for managing system permissions, configuring UI menu items, SVG icons, custom codes, and generating sidebar navigation menu trees.

---

## 1. GET `/api/v1/permissions` (List Permissions)

Retrieves all registered permissions. Supports filtering specifically for UI sidebar menu items (`is_menu=true`).

- **URL Path**: `/api/v1/permissions`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_READ`

### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `skip` | `int` | No | Pagination offset |
| `limit` | `int` | No | Maximum items to return |
| `is_menu` | `boolean` | No | Filter by menu item status (`true` or `false`) |
| `module` | `string` | No | Filter by module name (e.g. `User`, `Role`, `Permission`, `Dashboard`) |

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/permissions?module=User" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Permissions retrieved successfully",
  "data": [
    {
      "id": 3,
      "name": "View Users",
      "code": "USER_READ",
      "module": "User",
      "description": "View user accounts and list menu",
      "is_menu": true,
      "icon": "<svg ...></svg>",
      "path": "/users/list",
      "sort_order": 1,
      "created_at": "2026-09-05T08:50:00",
      "updated_at": "2026-09-05T08:50:00"
    }
  ]
}
```

---

## 2. GET `/api/v1/permissions/grouped` (Permissions Grouped by Module)

Retrieves all permissions categorized and grouped by their assigned module (`User`, `Role`, `Permission`, `Dashboard`). Ideal for rendering role management checkboxes grouped by module.

- **URL Path**: `/api/v1/permissions/grouped`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_READ`

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/permissions/grouped" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Permissions grouped by module retrieved successfully",
  "data": [
    {
      "module": "User",
      "permissions": [
        {
          "id": 3,
          "name": "View Users",
          "code": "USER_READ",
          "module": "User",
          "description": "View user accounts and list menu",
          "is_menu": true,
          "icon": "<svg ...></svg>",
          "path": "/users/list",
          "sort_order": 1,
          "created_at": "2026-09-05T08:50:00",
          "updated_at": "2026-09-05T08:50:00"
        }
      ]
    },
    {
      "module": "Role",
      "permissions": [ ... ]
    }
  ]
}
```

---

## 3. GET `/api/v1/permissions/menu-tree` (Sidebar Menu Items)

Retrieves all registered menu permissions (`is_menu=true`) sorted by `sort_order` for rendering frontend sidebar navigations.

- **URL Path**: `/api/v1/permissions/menu-tree`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_READ`

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/permissions/menu-tree" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Sidebar menu tree retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Dashboard",
      "code": "DASHBOARD_VIEW",
      "module": "Dashboard",
      "is_menu": true,
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...></svg>",
      "path": "/dashboard",
      "sort_order": 1
    },
    {
      "id": 2,
      "name": "User Management",
      "code": "USER_MANAGEMENT_MENU",
      "module": "User",
      "is_menu": true,
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...></svg>",
      "path": "/users",
      "sort_order": 2
    }
  ]
}
```

---

## 4. POST `/api/v1/permissions` (Create Permission / Menu Item)

Creates a new permission. Accepts UI mapping & module grouping fields (`name`, `code`, `module`, `is_menu`, `icon`, `path`, `sort_order`).

- **URL Path**: `/api/v1/permissions`
- **HTTP Method**: `POST`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_CREATE`

### Request Body (JSON)
```json
{
  "name": "Analytics Dashboard",
  "code": "ANALYTICS_VIEW",
  "module": "Analytics",
  "description": "View analytics and metric reports",
  "is_menu": true,
  "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><line x1=\"18\" y1=\"20\" x2=\"18\" y2=\"10\"/><line x1=\"12\" y1=\"20\" x2=\"12\" y2=\"4\"/><line x1=\"6\" y1=\"20\" x2=\"6\" y2=\"14\"/></svg>",
  "path": "/analytics",
  "sort_order": 3
}
```

### cURL Example
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/permissions" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Analytics Dashboard",
    "code": "ANALYTICS_VIEW",
    "module": "Analytics",
    "description": "View analytics reports",
    "is_menu": true,
    "icon": "<svg>...</svg>",
    "path": "/analytics",
    "sort_order": 3
  }'
```

### Success Response (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Permission created successfully",
  "data": {
    "id": 15,
    "name": "Analytics Dashboard",
    "code": "ANALYTICS_VIEW",
    "module": "Analytics",
    "description": "View analytics reports",
    "is_menu": true,
    "icon": "<svg>...</svg>",
    "path": "/analytics",
    "sort_order": 3,
    "created_at": "2026-09-05T09:10:00",
    "updated_at": "2026-09-05T09:10:00"
  }
}
```

---

## 4. GET `/api/v1/permissions/{permission_id}` (Get Permission Details)

Retrieves details of a specific permission.

- **URL Path**: `/api/v1/permissions/{permission_id}`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_READ`

### cURL Example
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/permissions/15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 5. PUT `/api/v1/permissions/{permission_id}` (Update Permission / Menu)

Updates permission properties (such as updating SVG icon, changing path, or changing menu parent).

- **URL Path**: `/api/v1/permissions/{permission_id}`
- **HTTP Method**: `PUT`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_UPDATE`

### Request Body (JSON)
```json
{
  "name": "Advanced Analytics",
  "sort_order": 4
}
```

### cURL Example
```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/permissions/15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Analytics",
    "sort_order": 4
  }'
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Permission updated successfully",
  "data": {
    "id": 15,
    "name": "Advanced Analytics",
    "code": "ANALYTICS_VIEW",
    "sort_order": 4
  }
}
```

---

## 6. DELETE `/api/v1/permissions/{permission_id}` (Delete Permission)

Deletes a permission record.

- **URL Path**: `/api/v1/permissions/{permission_id}`
- **HTTP Method**: `DELETE`
- **Authentication**: `Bearer <JWT Token>` required
- **RBAC Permission Required**: `PERMISSION_DELETE`

### cURL Example
```bash
curl -X DELETE "http://127.0.0.1:8000/api/v1/permissions/15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Permission deleted successfully",
  "data": null
}
```
