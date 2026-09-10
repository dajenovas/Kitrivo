# 🔑 Authentication API Endpoints (`/api/v1/auth`)

This document provides step-by-step usage instructions for JWT authentication, token refreshing, logout token invalidation, password complexity rules, and user profile management endpoints.

---

## 🔒 Password Complexity Requirements

All passwords across creation, update, and password change endpoints must satisfy:

1. **Minimum length**: **6 characters**
2. At least **1 Uppercase letter** (`A-Z`)
3. At least **1 Lowercase letter** (`a-z`)
4. At least **1 Number** (`0-9`)
5. At least **1 Special character** (`!@#$%^&*()_+-=[]{}|;:,.<>?/`)

Example valid password: `Admin@123!`

---

## 1. POST `/api/v1/auth/login` (JSON Login)

Authenticates user credentials and returns both an `access_token` (3600s) and a 1-day `refresh_token`.

- **URL Path**: `/api/v1/auth/login`
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

### Request Body (JSON)
```json
{
  "username_or_email": "admin@example.com",
  "password": "Admin@123!"
}
```

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

---

## 2. POST `/api/v1/auth/refresh` (Refresh Access Token)

Generates a new `access_token` and `refresh_token` pair using a valid refresh token. Revokes the old refresh token.

- **URL Path**: `/api/v1/auth/refresh`
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

---

## 3. POST `/api/v1/auth/logout` (Logout & Invalidate Tokens)

Logs out the user and invalidates both `access_token` and `refresh_token` in the server blocklist.

- **URL Path**: `/api/v1/auth/logout`
- **HTTP Method**: `POST`

---

## 4. GET `/api/v1/auth/me` (User Profile & Navigation Menu)

Fetches profile info, assigned roles, permissions, and sidebar navigation menu for the currently authenticated user.

- **URL Path**: `/api/v1/auth/me`
- **HTTP Method**: `GET`
- **Authentication**: `Bearer <access_token>` required

### Success Response (HTTP 200 OK)
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
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
    "permission_codes": [
      "DASHBOARD_VIEW",
      "USER_MANAGEMENT_MENU",
      "USER_READ",
      "USER_CREATE",
      "USER_UPDATE",
      "USER_DELETE",
      "ROLE_READ",
      "ROLE_CREATE",
      "ROLE_UPDATE",
      "ROLE_DELETE",
      "PERMISSION_READ",
      "PERMISSION_CREATE",
      "PERMISSION_UPDATE",
      "PERMISSION_DELETE"
    ],
    "menu_tree": [ ... ]
  }
}
```

---

## 5. POST `/api/v1/auth/change-password` (Change Password)

Allows an authenticated user to change their password. Validates password complexity and ensures `new_password` matches `confirm_new_password`.

- **URL Path**: `/api/v1/auth/change-password`
- **HTTP Method**: `POST`
- **Authentication**: `Bearer <access_token>` required
- **Content-Type**: `application/json`

### Request Body (JSON)
```json
{
  "current_password": "Admin@123!",
  "new_password": "NewSecurePass@456",
  "confirm_new_password": "NewSecurePass@456"
}
```
