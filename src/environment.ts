export const environment = {
  production: false,
  NX_CLIENTID: '2ee516a9-782c-440b-b794-ed4a52bbc785',
  NX_AUTHORITY: 'https://cubivueidentityqa.ciamlogin.com/',
  NX_SCOPES: ['openid', 'profile'],
  NX_REDIRECT_URL: 'http://localhost:4200',
  NX_BASE_AM_URL: process.env['NX_BASE_AM_URL'] || 'https://app-cubivuesaasmicroservicesareamanagement-qa-001.azurewebsites.net/',
  apiUrl: process.env['NX_BASE_DPS_URL'] || 'http://localhost:4200/api'
};
