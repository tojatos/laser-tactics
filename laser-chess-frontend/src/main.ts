import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const baseHref = document.querySelector('base')?.getAttribute('href') || '/';
document.querySelector('base')?.setAttribute('href', environment.baseHref);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
