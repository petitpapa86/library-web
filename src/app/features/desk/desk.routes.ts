import { Routes } from '@angular/router';

export const deskRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./container/desk-shell-container.component').then(m => m.DeskShellContainerComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'circulation' },
      { path: 'circulation', loadComponent: () => import('./container/circulation-container.component').then(m => m.CirculationContainerComponent) },
      { path: 'copies', loadComponent: () => import('./container/copies-container.component').then(m => m.CopiesContainerComponent) },
      { path: 'titles', loadComponent: () => import('./container/titles-container.component').then(m => m.TitlesContainerComponent) },
      { path: 'patrons', loadComponent: () => import('./container/patrons-container.component').then(m => m.PatronsContainerComponent) },
      { path: 'fines', loadComponent: () => import('./container/fines-container.component').then(m => m.FinesContainerComponent) },
      { path: 'reports', loadComponent: () => import('./container/reports-container.component').then(m => m.ReportsContainerComponent) },
    ],
  },
];
