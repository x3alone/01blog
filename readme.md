# 01Blog - Project Overview

## 📖 Introduction
**01Blog** is a robust, full-stack social platform built with **Spring Boot** (Backend) and **Angular** (Frontend). It is designed to demonstrate a secure, scalable, and modern architecture suitable for enterprise-grade applications.

This project implements a complete social media flow including user authentication, post creation with rich media (images/videos), commenting, liking, and administrative controls.

---

## 🏗 High-Level Architecture
This project follows a **Decoupled Client-Server Architecture**:

- **Backend (API Layer):** Built with **Spring Boot 3**, providing a secure RESTful API. It handles business logic, database interactions, and authentication.
- **Frontend (Client Layer):** Built with **Angular** (Standalone Components), serving as a Single Page Application (SPA). It consumes the API to render a dynamic user interface.
- **Database:** **PostgreSQL** for relational data storage.
- **Media Storage:** **Cloudinary** for scalable image and video hosting.

### Why this stack?
| Technology | Role | Why it was chosen |
|------------|------|-------------------|
| **Spring Boot 3** | Backend | Enterprise standard for Java, offers dependency injection, robust security, and rapid development. |
| **Angular** | Frontend | Strict structure, strong typing (TypeScript), and powerful tools for complex enterprise apps. |
| **PostgreSQL** | Database | Reliable, ACID-compliant relational database for structured data (users, posts, relations). |
| **JWT (JSON Web Token)** | Security | Stateless authentication mechanism, allowing the API to scale easily. |

---

## 🚀 Main Features

### 1. Authentication & Security (🛡️)
- **JWT-Based Auth:** Secure login and registration.
- **Role-Based Access Control (RBAC):** Distinct roles for **USER** and **ADMIN**.
    - *Users* can post, like, and comment.
    - *Admins* can manage users and moderate content.
- **Password Hashing:** Uses **BCrypt** for storing credentials securely.

### 2. Post Management (📝)
- **Rich Media:** Users can upgrade posts with images or videos (stored in Cloudinary).
- **CRUD Operations:** Create, Read, Update, and Delete posts.
- **Interactive Feed:** Infinite scroll or pagination for browsing content.

### 3. Social Interaction (❤️)
- **Likes System:** Real-time like/unlike functionality.
- **Comments:** Threaded or linear discussions on posts.

### 4. Admin Dashboard (👮‍♂️)
- Dedicated area for administrators to view, report, or remove content and ban users.

---

## 🛠 Technologies Stack
### Backend
- **Framework:** Spring Boot 3.3.2
- **Language:** Java 17
- **Database:** PostgreSQL
- **Security:** Spring Security 6 + JWT
- **Tools:** Lombok, Maven, Cloudinary SDK

### Frontend
- **Framework:** Angular (Standalone Components)
- **Language:** TypeScript
- **Styling:** SCSS / Custom CSS (Glassmorphism design)
- **State Management:** RxJS (Observables)
- **HTTP Client:** Angular HttpClient

---

## 🎯 How to Run
1. **Backend:**
   ```bash
   ./mvnw spring-boot:run
   ```
2. **Frontend:**
   ```bash
   cd frontend-01blog
   ng serve --open
   ```