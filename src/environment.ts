export const environment = {
  production: false,
  NX_CLIENTID: '99f54d54-ce51-46c9-8f30-4efd9ea250f4',
  NX_AUTHORITY: 'https://cubivueidentity.ciamlogin.com/',
  NX_SCOPES: ['openid', 'profile'],
  NX_REDIRECT_URL: 'http://localhost:5000',
  NX_BASE_AM_URL: process.env['NX_BASE_AM_URL'] || 'https://app-cubivuesaasmicroservicesareamanagement-qa-001.azurewebsites.net/',
  apiUrl: process.env['NX_BASE_DPS_URL'] || 'http://localhost:4200/api'
};
