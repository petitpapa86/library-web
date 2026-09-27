import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { LogLevel, authInterceptor, provideAuth, withAppInitializerAuthCheck } from 'angular-auth-oidc-client';
import { authSettings } from './core/auth/auth.settings';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // The access token goes only to the API (secureRoutes), never to Keycloak or anywhere else.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor()])),
    provideRouter(routes, withComponentInputBinding()),
    provideAuth(
      {
        config: {
          authority: authSettings.authority,
          clientId: authSettings.clientId,
          redirectUrl: window.location.origin,
          postLogoutRedirectUri: window.location.origin,
          scope: 'openid profile email',
          responseType: 'code',
          silentRenew: true,
          useRefreshToken: true,
          // Keycloak issues refresh tokens to this client without the offline_access scope.
          disableRefreshTokenOfflineAccessScopeWarning: true,
          renewTimeBeforeTokenExpiresInSeconds: 30,
          // Roles come from the id token's "role" claim; the userinfo endpoint doesn't carry it.
          autoUserInfo: false,
          secureRoutes: [authSettings.apiPrefix],
          logLevel: LogLevel.Warn,
        },
      },
      withAppInitializerAuthCheck(),
    ),
  ],
};
