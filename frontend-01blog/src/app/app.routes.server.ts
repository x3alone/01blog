import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'user/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'post/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
