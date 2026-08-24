# REST API Contract - Sarees For Naaris Auth Service

All authentication API endpoints are prefixed with `/api/auth`. All requests and responses are in JSON format.

---

## 1. User Registration
Creates an unverified account and generates a 6-digit verification OTP.
- **URL:** `/api/auth/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "sareelover",
    "email": "buyer@example.com",
    "password": "securepassword123",
    "role": "USER"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "User registered successfully. Please verify your email with the OTP sent."}`
  - `400 Bad Request`: `{"message": "Error: Username is already taken!"}` or `{"message": "Error: Email is already in use!"}`

---

## 2. Verify OTP
Verifies the numeric OTP generated during registration or password reset.
- **URL:** `/api/auth/verify-otp`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "buyer@example.com",
    "otpCode": "123456",
    "purpose": "REGISTRATION"
  }
  ```
- **Responses:**
  - `200 OK` (Registration): `{"message": "OTP verified successfully. Your account is now active."}`
  - `200 OK` (Reset): `{"message": "OTP verified successfully.", "resetToken": "uuid-reset-token-here"}`
  - `401 Unauthorized`: `{"message": "Error: Invalid or expired OTP."}`

---

## 3. Resend OTP
Regenerates a new verification code.
- **URL:** `/api/auth/resend-otp`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "buyer@example.com",
    "purpose": "REGISTRATION"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "OTP resent successfully."}`
  - `400 Bad Request`: `{"message": "Error: Email not found."}`

---

## 4. User Login
Authenticates the user and returns JWT access + refresh tokens.
- **URL:** `/api/auth/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "buyer@example.com", 
    "password": "securepassword123"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "token": "eyJhbGciOi...",
      "type": "Bearer",
      "refreshToken": "70377e84-...",
      "id": 1,
      "username": "sareelover",
      "email": "buyer@example.com",
      "role": "USER"
    }
    ```
  - `401 Unauthorized`: `{"message": "Error: Invalid username or password."}`
  - `403 Forbidden`: `{"message": "Error: Account is not verified. A new OTP has been sent."}`

---

## 5. Token Refresh
Retrieves a new access token using a valid refresh token.
- **URL:** `/api/auth/refresh`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "refreshToken": "70377e84-..."
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "70377e84-..."
    }
    ```
  - `400 Bad Request`: `{"message": "Refresh token is not in database!"}`

---

## 6. Forgot Password
Requests a password reset code.
- **URL:** `/api/auth/forgot-password`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "buyer@example.com"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "If your email is registered, we have sent a reset OTP."}` (Note: returns 200 even if email is missing to prevent enumeration).

---

## 7. Reset Password
Sets a new password using the reset token or OTP code.
- **URL:** `/api/auth/reset-password`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "buyer@example.com",
    "otpCode": "uuid-reset-token-here",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "Password has been reset successfully."}`
  - `401 Unauthorized`: `{"message": "Error: Invalid or expired reset credentials."}`

---

## 8. Change Password (Authenticated)
Updates the password of the logged-in user.
- **URL:** `/api/auth/change-password`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <access_token>`
- **Request Body:**
  ```json
  {
    "oldPassword": "securepassword123",
    "newPassword": "newsecurepassword123"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "Password changed successfully."}`
  - `400 Bad Request`: `{"message": "Error: Old password does not match."}`

---

## 9. Logout (Authenticated)
Revokes the current session's refresh token on the server database.
- **URL:** `/api/auth/logout`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <access_token>`
- **Responses:**
  - `200 OK`: `{"message": "Log out successful!"}`

---

## 10. Get Current User Details (Authenticated)
Retrieves account information for the active JWT session.
- **URL:** `/api/auth/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <access_token>`
- **Responses:**
  - `200 OK`:
    ```json
    {
      "id": 1,
      "username": "sareelover",
      "email": "buyer@example.com",
      "role": "USER"
    }
    ```
