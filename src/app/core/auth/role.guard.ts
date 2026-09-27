import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Role } from './role.model';
import { Session } from './session';

// Signed out: off to Keycloak's sign-in page, coming back to this address. Signed in without the role: back home.
export function roleGuard(role: Role | 'signed-in'): CanMatchFn {
  return (_route, segments) => {
    const session = inject(Session);
    if (!session.isSignedIn()) {
      session.signIn('/' + segments.map(s => s.path).join('/'));
      return false;
    }
    return role === 'signed-in' || session.hasRole(role) ? true : inject(Router).createUrlTree(['/']);
  };
}
