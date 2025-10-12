// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes'; // <-- match the actual export name

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withFetch()),  // provides HttpClient to all services/components
    provideRouter(routes)            // match the exported name
  ]
}).catch(err => console.error(err));
