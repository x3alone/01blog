# Security Documentation 

## 🛡️ Security Architecture Overview
This application follows a **Defense-in-Depth** strategy. Security is not just one layer; it is implemented at the Database, API, and Client levels.

---

## 1️⃣ Authentication (Who are you?)
We use **Stateless JWT (JSON Web Token)** authentication. 

### The Flow
1. **Credentials Entrusted:** User sends plaintext password over HTTPS (SSL).
2. **Verification:** Backend looks up the user.
3. **Hashing check:** The incoming password is hashed and compared to the stored BCrypt hash.
   - *Note:* We **NEVER** store plain passwords.
4. **Token Issue:** If match, server signs a JWT with a **Secret Key**.
   - Payload: `{ sub: "user123", role: "ADMIN", exp: 1711000... }`
5. **Token Usage:** Client stores this token and sends it in the header for every request.

### Why Stateless?
- **Scalability:** The server doesn't need to remember "logged in" users in memory. Any server instance can verify the token math.
- **Performance:** No database lookup required just to check if a session session ID is valid (unless checking a blacklist).

---

## 2️⃣ Authorization (What can you do?)
We Implement **Role-Based Access Control (RBAC)**.

### Layers of Check
1. **URL Level (SecurityConfig):** 
   - coarse-grained defaults.
   - `/api/admin/**` is locked to `hasRole('ADMIN')`.
2. **Method Level (@PreAuthorize):**
   - fine-grained control.
   - `postService.deletePost()` checks if the current user is the **owner** of the post OR an **admin**.
   - Annotation: `@PreAuthorize("#post.userId == authentication.principal.id")` (conceptual example).

---

## 3️⃣ Threat Mitigation

### A. SQL Injection (SQLi)
**Risk:** Attackers entering `' OR 1=1 --` to steal data.
**Defense:** We use **Spring Data JPA** and **Hibernate**.
- Hibernate uses **Parameterized Queries** by default.
- Input is treated as data, never as executable code.
- We do **not** engage in manual String concatenation for SQL queries.

### B. Cross-Site Scripting (XSS)
**Risk:** Attackers injecting `<script>alert('hack')</script>` into comments.
**Defense:** 
- **Angular Default:** Angular fundamentally treats all values bound to the DOM as untrusted by default. It sanitizes and escapes HTML automatically.
- **Backend Validation:** We can strip basic specific tags if necessary before saving.

### C. Cross-Origin Resource Sharing (CORS)
**Risk:** Malicious site making requests to our backend.
**Defense:** 
- Our `CorsConfiguration` explicitly allows traffic **only** from trusted origins (during dev: `*`, in prod: specific domains).

### D. Invalid Input / Bad Data
**Risk:** Users sending huge text blobs or nulls.
**Defense:** **Jakarta Validation** (`@Valid`).
- `@NotNull`, `@Size(max=500)`, `@Email`.
- If validation fails, the request is rejected immediately with `400 Bad Request` before it touches the business logic.

---

## 4️⃣ Media Security
- **Cloudinary:** We do not execute user-uploaded files on our server.
- They are proxied to Cloudinary.
- **Validation:** We check file types (MIME types) to ensure only Images/Videos are uploaded, not `.exe` or `.sh` scripts.
