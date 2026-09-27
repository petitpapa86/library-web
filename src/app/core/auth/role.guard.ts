import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { Role } from './role.model';
import { Session } from './session';

// Signed out: off to Keycloak's sign-in page. Signed in without the role: back to the home page.
export function roleGuard(role: Role | 'signed-in'): CanMatchFn {
  return () => {
    const session = inject(Session);
    if (!session.isSignedIn()) {
      session.signIn();
      return false;
    }
    return role === 'signed-in' || session.hasRole(role) ? true : inject(Router).createUrlTree(['/']);
  };
}
