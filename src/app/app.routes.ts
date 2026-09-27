import { Routes } from '@angular/router';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadChildren: () => import('./features/home').then(m => m.homeRoutes) },
  { path: 'search', canMatch: [roleGuard('signed-in')], loadChildren: () => import('./features/search').then(m => m.searchRoutes) },
  { path: 'account', canMatch: [roleGuard('patron')], loadChildren: () => import('./features/account').then(m => m.accountRoutes) },
  { path: 'desk', canMatch: [roleGuard('librarian')], loadChildren: () => import('./features/desk').then(m => m.deskRoutes) },
  { path: '**', redirectTo: '' },
];
