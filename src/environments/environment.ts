// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  API_URL: 'http://localhost:8080',
  STORAGE_URL: 'https://kanagawawfdb.blob.core.windows.net/calm-share',
  STORAGE_ACCOUNT_SAS: 'sv=2017-07-29&ss=bfqt&srt=sco&sp=rwdlacup&se=2018-03-23T11:14:00Z&st=2018-03-23T03:14:00Z&spr=https&sig=NnVcnY9jn6UhEOAMXa8wr%2BLkuArSp9sisGM8F%2B%2BHX9M%3D',
  // API_URL: 'https://kanagawa-web.azurewebsites.net',
  IOT_CONSUMER_GROUP: 'kanagawaconsumers'
};
