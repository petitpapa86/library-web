import { Injectable, computed, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Role, rolesFrom } from './role.model';

// Who is signed in, from the id token's claims. Signing in and out go through Keycloak's pages.
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly oidc = inject(OidcSecurityService);

  readonly isSignedIn = computed(() => this.oidc.authenticated().isAuthenticated);
  private readonly claims = computed<unknown>(() => this.oidc.userData().userData);
  readonly roles = computed<Role[]>(() => rolesFrom(this.claims()));
  readonly userName = computed(() => {
    const claims = this.claims();
    if (typeof claims !== 'object' || claims === null) return null;
    const { name, preferred_username } = claims as { name?: unknown; preferred_username?: unknown };
    return typeof name === 'string' ? name : typeof preferred_username === 'string' ? preferred_username : null;
  });
  readonly isPatron = computed(() => this.roles().includes('patron'));
  readonly isLibrarian = computed(() => this.roles().includes('librarian'));

  hasRole(role: Role): boolean {
    return this.roles().includes(role);
  }

  signIn(): void {
    this.oidc.authorize();
  }

  signOut(): void {
    this.oidc.logoff().subscribe();
  }
}
