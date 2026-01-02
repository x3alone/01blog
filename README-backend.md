# Spring Boot Backend Documentation

## 🧠 Overview
The backend is the "Brain" of the application. It exposes a **RESTful API** that the Angular frontend consumes. It is built using **Spring Boot 3**, which simplifies the setup of Spring applications.

### Key Concepts
- **Controller:** The "Front Desk". Receives HTTP requests and decides who handles them.
- **Service:** The "Worker". Contains the actual business logic (rules, calculations).
- **Repository:** The "Librarian". Talks to the database to fetch/save data.
- **Entity:** Represents a table in the database (e.g., `User`, `Post`).

---

## 1️⃣ Application Execution Flow
When the application starts (`01BlogApplication.java`):
1. **@SpringBootApplication:** This annotation triggers auto-configuration. It scans the project for components.
2. **Context Initialization:** Spring creates "Beans" (managed objects) for all Controllers, Services, and Repositories.
3. **Database Connection:** Connects to PostgreSQL using settings in `application.properties`.

---

## 2️⃣ Request Lifecycle (The Journey of a Request)
When a user clicks "Create Post" on the frontend, here is the journey:

**Client (Angular)** ➡️ **Controller** ➡️ **Security Layer** ➡️ **Service** ➡️ **Repository** ➡️ **Database**

### Example: Creating a Post
1. **HTTP Request:** The frontend sends a `POST /api/posts` request using `multipart/form-data` (to handle text + image).
2. **Security Filter (`JwtAuthFilter`):**
   - Intercepts the request.
   - Checks the `Authorization` header for a valid **JWT Token**.
   - If valid, sets the `Authentication` context (User ID, Roles).
   - If invalid, returns `401 Unauthorized`.
3. **Controller (`PostController`):**
   - Receives the request.
   - Example method:
     ```java
     @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
     public ResponseEntity<PostResponse> createPost(...) { ... }
     ```
   - Validates inputs (e.g., title not empty).
   - Passes data to the Service.
4. **Service (`PostService`):**
   - **Business Logic Layer.**
   - Uploads the image to **Cloudinary** (if present).
   - Creates a `Post` entity.
   - Sets the date and author.
   - Saves it via the Repository.
5. **Repository (`PostRepository`):**
   - Extends `JpaRepository`.
   - Generates the SQL: `INSERT INTO posts (...) VALUES (...)`.
6. **Response:**
   - The saved Post is converted to a DTO (`PostResponse`).
   - Returned as JSON with HTTP `201 Created`.

---

## 3️⃣ Key Components Detailed

### A. Controllers (`@RestController`)
Responsible for defining endpoints.
- **`@RequestMapping("/api/posts")`**: Define base URL.
- **`@GetMapping`, `@PostMapping`**: Map HTTP verbs.
- **`ResponseEntity<>`**: strictly types the HTTP response (Status Code + Body).

### B. Dependency Injection (DI)
We use **Constructor Injection** (Best Practice).
```java
@Service
public class PostService {
    private final PostRepository postRepository;

    // Spring treats this constructor as an @Autowired point
    public PostController(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
}
```
*Why?* It ensures the class cannot work without its dependencies and makes testing easier.

### C. JPA & Hibernate (Database Layer)
We use **Spring Data JPA**.
- **@Entity**: Marks a class as a database table.
- **@Id & @GeneratedValue**: Defines Primary Key.
- **Relationships**:
  - `User` **@OneToMany** `Post` (One user has many posts).
  - `Post` **@OneToMany** `Comment`.

### D. Validation
We use standard **Jakarta Validation**.
- `@NotBlank`, `@Size(min=5)`: Ensures data integrity *before* it hits the logic.
- `@Valid`: Triggers validation in the controller.

---

## 4️⃣ Security Architecture
Security is handled by `SecurityConfig.java`.

### JWT Flow
1. **Login:** User sends credentials → Server validates → Generates JWT (String).
2. **Access:** User sends JWT in header (`Bearer eyJhbG...`).
3. **Statelessness:** The server does *not* store sessions. It trusts the signed token.

### Configurations
- **BCrypt:** Passwords are never stored as plain text. They are hashed.
- **CORS:** Configured to allow the Angular app to talk to the Backend.
- **Matchers:**
  - `/api/auth/**` → Open to all.
  - `/api/posts` (POST) → Authenticated only.

---

## 5️⃣ External Services
### Cloudinary (Media)
- Used for off-loading heavy media files.
- **Flow:** App sends file → Service uploads to Cloud → Cloud returns URL → App saves URL in Database.
- Keeps the database light (only stores strings/URLs).
