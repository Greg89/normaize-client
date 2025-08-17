export const auth0Config = {
  domain: 'test-domain.auth0.com',
  clientId: 'test-client-id',
  authorizationParams: {
    redirect_uri: 'http://localhost:3000',
    audience: 'test-audience',
  },
  cacheLocation: 'localstorage',
};
