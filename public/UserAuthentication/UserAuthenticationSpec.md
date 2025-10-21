# API Specification: UserAuthentication Concept

**Purpose:** limit access to known users

---

## API Endpoints

### POST /api/UserAuthentication/register

**Description:** Registers a new user account with a unique username and password.

**Requirements:**
- username does not exist already

**Effects:**
- creates a new User with username and password

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "User": "User"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---

### POST /api/UserAuthentication/authenticate

**Description:** Authenticates an existing user by verifying their username and password.

**Requirements:**
- user with username and password to exist

**Effects:**
- returns user

**Request Body:**
```json
{
  "username": "String",
  "password": "String"
}
```

**Success Response Body (Action):**
```json
{
  "User": "User"
}
```

**Error Response Body:**
```json
{
  "error": "string"
}
```
---