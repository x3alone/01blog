# Architectural Overview & Design Decisions

## 🏛 Big Picture Architecture
The 01Blog System is designed as a **Distributed Web Application**. 

```ascii
[ Client Layer (Browser) ]        [ Internet ]        [ API Layer (Server) ]       [ Data Layer ]
      Angular SPA        <----->   HTTP/REST   <----->    Spring Boot       <----->  PostgreSQL
       (Render)                                          (Logic/Security)            (Storage)
           |                                                    |
           +-------------------> [ Cloudinary ] <---------------+
                             (Media / CDN)
```

---

## 1️⃣ Separation of Concerns
We strictly adhere to the **Single Responsibility Principle** at the macro level.

- **Frontend (UI focus):** Handles display, animations, user input, and navigation. It knows *nothing* about how to calculate business rules or connect to a DB.
- **Backend (Logic focus):** Handles data integrity, security, and persistence. It knows *nothing* about HTML, CSS, or how the page looks.

### Why this split?
- **Parallel Development:** Frontend and Backend teams can work independently once the API contract is defined.
- **Multi-Client Ready:** If we want to build a Mobile App (iOS/Android) later, we reuse the **same** Backend API.

---

## 2️⃣ Scalability Strategy

### Stateless Backend
Because we use **JWT** instead of Sessions:
- The backend servers do not hold state.
- If traffic spikes, we can spin up 10 instances of the Spring Boot app behind a Load Balancer. Any instance can handle any request.

### Media Offloading
- We do not store images/videos on the application server disk.
- Storing files locally crashes servers when disk fills up.
- **Solution:** Cloudinary acts as a Content Delivery Network (CDN), serving media faster and closer to the user.

---

## 3️⃣ Database Design (Relational)
We chose a Relational DB (**PostgreSQL**) because our data is highly structured and related.

- **Users** have many **Posts**.
- **Posts** have many **Comments**.
- **Posts** have many **Likes**.

Ideally suited for SQL `JOIN` operations to ensure data consistency (ACID Compliance).

---

## 4️⃣ Trade-offs & Limitations

### Complexity vs. Speed
- **Trade-off:** Setting up a full separate Frontend+Backend is more complex than a simple monolithic Thymeleaf app.
- **Benefit:** Better user experience (SPA feels like a native app) and better long-term maintainability.

### Initial Load Time
- **limitation:** Angular apps load a large JavaScript bundle on result.
- **Mitigation:** We use **Lazy Loading** (routes are loaded only when requested) to keep the initial load fast.

### Consistency
- **Trade-off:** Distributed media (Cloudinary) implies we must ensure the Database URL and the implementation file stay in sync.
- **Solution:** We handle deletions carefully. If a post is deleted, we trigger a Cloudinary API call to remove the image.

---

## 5️⃣ Future Improvements
- **Caching:** Add Redis for caching frequent `GET /api/posts` requests.
- **WebSockets:** Implement real-time notifications for likes/comments.
