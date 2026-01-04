import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

import { routes } from './app.routes';
import { authInterceptorFn } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),

    //register interceptors in standalone Angular
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptorFn])
    ),

    provideClientHydration(withEventReplay()),
    provideZonelessChangeDetection(),
  ]
};
