import { Routes } from '@angular/router';

export const homeRoutes: Routes = [
  { path: '', loadComponent: () => import('./container/home-container.component').then(m => m.HomeContainerComponent) },
];
