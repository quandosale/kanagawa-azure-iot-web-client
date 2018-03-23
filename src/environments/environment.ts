// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  API_URL: 'http://localhost:8080',
  // API_URL: 'https://kanagawa-web.azurewebsites.net',
  STORAGE_URL: 'https://kanagawawfdb.blob.core.windows.net/calm-share',
  STORAGE_ACCOUNT_SAS: 'sv=2017-07-29&ss=bfqt&srt=sco&sp=rwdlacup&se=2019-03-28T00:45:11Z&st=2018-03-23T16:45:11Z&spr=https&sig=0DHQQIH18oWKYGC7CLZZMoPt6CXnrKzE5WtSK4e4gwE%3D',

  IOT_CONSUMER_GROUP: 'kanagawaconsumers'
};
