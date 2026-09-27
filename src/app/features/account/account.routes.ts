import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  { path: '', loadComponent: () => import('./container/account-container.component').then(m => m.AccountContainerComponent) },
];
