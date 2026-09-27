import { Routes } from '@angular/router';

export const searchRoutes: Routes = [
  { path: '', loadComponent: () => import('./container/search-container.component').then(m => m.SearchContainerComponent) },
];
