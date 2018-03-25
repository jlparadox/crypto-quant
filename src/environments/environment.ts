// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBq0bFwvk8NsSFQ9pDmwmdPaHYoKjN5o8k',
    authDomain: 'crypto-quant.firebaseapp.com',
    databaseURL: 'https://crypto-quant.firebaseio.com',
    projectId: 'crypto-quant',
    storageBucket: 'crypto-quant.appspot.com',
    messagingSenderId: '733155364394'
  }
};
