// The Keycloak realm of dotnet-library (keycloak/library-realm.json, client "library-web": Authorization Code + PKCE).
// The API is reached through the dev-server proxy at /api (proxy.conf.json), so it needs no CORS.
export const authSettings = {
  authority: 'http://localhost:8080/realms/library',
  clientId: 'library-web',
  apiPrefix: '/api/',
} as const;
