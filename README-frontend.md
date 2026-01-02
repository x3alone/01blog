# Angular Frontend Documentation

## 🎨 Overview
The frontend is the "Face" of the application. It is built with **Angular (Version 20.3.0)** using the modern **Standalone Components** architecture.

### Architecture Strategy
- **Component-Based:** Each UI part (Button, Navbar, Post Card) is a reusable component.
- **Service-Based Logic:** Components shouldn't talk to APIs directly; they delegate to **Services**.
- **Reactive Programming:** Uses **RxJS** (Observables) to handle asynchronous data streams.

---

## 1️⃣ Application Structure

### 📂 Key Folders
- **`src/app/pages`**: Full views (e.g., `HomeComponent`, `LoginComponent`).
- **`src/app/components`**: Reusable widgets (e.g., `NavbarComponent`, `PostCardComponent`).
- **`src/app/services`**: API Communication (e.g., `PostService`, `AuthService`).
- **`src/app/guards`**: Route protection (e.g., `AuthGuard`).
- **`src/app/interceptors`**: HTTP Traffic interception.

---

## 2️⃣ How It Works (The Flow)

### Step 1: Bootstrapping (`main.ts`)
The app starts in `main.ts`. It calls `bootstrapApplication(AppComponent, appConfig)`.
- **`app.config.ts`**: Provides global providers like `provideRouter`, `provideHttpClient`, and `provideAnimations`.

### Step 2: Routing (`app.routes.ts`)
Defines "Where to go".
```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [authGuard] // 🔒 Protected Route
  }
];
```

### Step 3: API Communication
**Scenario: User Clicks "Login"**

1. **Component (`LoginComponent`):**
   - Captures form input (username, password).
   - Calls `this.authService.login(credentials)`.
   
2. **Service (`AuthService`):**
   - **File:** `src/app/services/auth.service.ts`
   - Uses Angular `HttpClient`.
   - Sends `POST /api/auth/login`.
   - **RxJS Pipe:** Receives the response, extracts the `jwtToken`, and saves it to `localStorage` (Key: `01blog_auth_token`).

3. **Interceptor (`AuthInterceptor`):**
   - **File:** `src/app/interceptors/auth.interceptor.ts`
   - For every subsequent request (e.g., "Get Posts"), it "intercepts" the HTTP call.
   - Clones the request and adds the header: `Authorization: Bearer <token>`.
   - Ensures the backend knows who you are.

---

## 3️⃣ Deep Dive: Features

### A. Standalone Components
Instead of declaring everything in a Module, components import what they need directly.
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // explicit dependencies
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent { ... }
```
*Why?* Makes the app lighter, faster to build, and easier to lazy load.

### B. Forms & Validation
We use **Reactive Forms** (`FormGroup`, `FormControl`).
- Logic is defined in TypeScript, not HTML.
- **Validators:** `Validators.required`, `Validators.email`.
- **Feedback:** UI shows dynamic errors (e.g., `*ngIf="form.invalid"`).

### C. Signals & Observables
- **Observables ($):** Streams of data (e.g., HTTP responses). We `.subscribe()` to them to react when data arrives.
- **Async Pipe:** Used in HTML (`*ngFor="let post of posts$ | async"`) to automatically handle subscriptions/unsubscriptions (prevents memory leaks).

---

## 4️⃣ Media Upload Flow
1. **HTML:** `<input type="file" (change)="onFileSelected($event)">`.
2. **TS:** Captures the file object.
3. **Service:** Wraps it in `FormData` (browser standard for files).
   ```typescript
   // Actual code pattern from AuthService.uploadAvatar / PostService
   const formData = new FormData();
   formData.append('file', file);
   // ...
   return this.http.post(url, formData);
   ```
4. **Backend:** Receives it as `MultipartFile`.

---

## 5️⃣ Error Handling
- **Global Error Handling:** implemented in `AuthInterceptor`.
- If the API returns 401/403 (Unauthorized/Forbidden), the interceptor:
  1. Clears `localStorage` (removes `01blog_auth_token`).
  2. Redirects the user to `/login`.
