# FastAPI RBAC & User Management API - Master Documentation

Welcome to the official developer documentation for the **FastAPI RBAC & User Management API** (`/api/v1/`).

This backend application is built using Python 3.12, FastAPI, SQLAlchemy, and Pydantic v2. It provides a complete production-ready authentication, user management, and fine-grained Role-Based Access Control (RBAC) system with dynamic UI sidebar menu tree generation.

---

## 🌟 Architecture & Core Features

### 1. Base URL & Routing Architecture
- Base API path: `/api/v1/`
- Feature-based modular structure:
  - `app/api/v1/auth/`
  - `app/api/v1/users/`
  - `app/api/v1/roles/`
  - `app/api/v1/permissions/`

### 2. Unified API Response Envelope Format
Every API endpoint returns a standardized JSON response envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {} // or [] or null
}
```

For error responses (HTTP 400, 401, 403, 404, 422), the envelope remains consistent:

```json
{
  "success": false,
  "message": "Detailed error message",
  "data": null // or validation errors array
}
```

---

## 🔐 Role-Based Access Control (RBAC) Engine

### Permission Structure
Permissions represent both **System Actions** and **UI Navigation Sidebar Items**:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `int` | Unique Permission ID | `1` |
| `name` | `string` | Human readable title | `"User Management"` |
| `code` | `string` | Unique permission key used by Frontend & Backend | `"USER_READ"` |
| `description` | `string` | Optional explanation | `"Allows viewing user accounts"` |
| `is_menu` | `boolean` | Flag for UI Sidebar menu rendering | `true` |
| `icon` | `string` | SVG icon string or icon class for UI sidebar | `<svg ...></svg>` |
| `path` | `string` | Frontend route URL | `"/users/list"` |
| `module` | `string` | Module grouping name | `"User"` |
| `sort_order` | `int` | Display order in UI sidebar | `1` |

### How RBAC Authorization Works
1. Every incoming request to protected routes passes through the `PermissionChecker("REQUIRED_PERMISSION_CODE")` dependency.
2. The dependency validates the Bearer JWT token in the `Authorization` header.
3. The system retrieves all permissions across all Roles assigned to the user.
4. If `"REQUIRED_PERMISSION_CODE"` exists in the user's permission set, access is granted. Otherwise, an HTTP 403 Forbidden response envelope is returned.

---

## 📁 Detailed Endpoint Documentation Files

For complete step-by-step instructions on each endpoint module, refer to the following documentation files:

1. [🔑 Auth Endpoints Guide](file:///d:/APP/backend/docs/auth_endpoints.md) - Login (OAuth2 & JSON), Token Refresh (`/refresh`), Logout (`/logout`), User Profile (`/me`) with UI Sidebar Menu Tree, Change Password.
2. [👤 Users Endpoints Guide](file:///d:/APP/backend/docs/users_endpoints.md) - Create User, List Users, Get User by ID, Update User, Assign Roles (`POST /users/{id}/roles`), Delete User.
3. [🛡️ Roles Endpoints Guide](file:///d:/APP/backend/docs/roles_endpoints.md) - Create Role, List Roles, Get Role by ID, Update Role, Delete Role, Assign Permissions to Role.
4. [⚡ Permissions Endpoints Guide](file:///d:/APP/backend/docs/permissions_endpoints.md) - Create Permission, List Permissions, Get Permission by ID, Update Permission, Delete Permission, Get Sidebar Menu Tree.

---

## 🚀 Default System Seed Data

On application startup (`main.py`), the system seeds initial permissions, default roles, and a SuperAdmin user:

- **SuperAdmin Account**:
  - Email: `admin@example.com`
  - Username: `admin`
  - Password: `Admin@123!`
- **Default System Roles**:
  - `ROLE_SUPERADMIN`: Full system permissions.
  - `ROLE_ADMIN`: User, Role, and Permission CRUD.
  - `ROLE_USER`: Dashboard menu access (`DASHBOARD_VIEW`).
