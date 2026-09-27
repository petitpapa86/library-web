import { Injectable, computed, inject } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Role, rolesFrom } from './role.model';

// Who is signed in, from the id token's claims. Signing in and out go through Keycloak's pages.
@Injectable({ providedIn: 'root' })
export class Session {
  private static readonly returnUrlKey = 'library.returnUrl';
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

  // Keycloak sends the browser back to the app's root; returnUrl is where to go from there.
  signIn(returnUrl?: string): void {
    if (returnUrl) this.storage()?.setItem(Session.returnUrlKey, returnUrl);
    this.oidc.authorize();
  }

  // The address remembered by signIn, once: null when there is none.
  takeReturnUrl(): string | null {
    const storage = this.storage();
    const url = storage?.getItem(Session.returnUrlKey) ?? null;
    storage?.removeItem(Session.returnUrlKey);
    return url;
  }

  signOut(): void {
    this.oidc.logoff().subscribe();
  }

  private storage(): Storage | null {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
}
