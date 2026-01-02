import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
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
    provideRouter(routes),

    //register interceptors in standalone Angular
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptorFn])
    ),

    provideClientHydration(withEventReplay()),
    provideZonelessChangeDetection(),
  ]
};
