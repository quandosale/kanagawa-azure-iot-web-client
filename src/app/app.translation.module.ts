import { NgModule } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from './services/shared.services';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}

const translationOptions = {
  loader: {
    provide: TranslateLoader,
    useFactory: (createTranslateLoader),
    deps: [Http]
  }
};

@NgModule({
  imports: [TranslateModule.forRoot(translationOptions)],
  exports: [TranslateModule],
  providers: [TranslateService]
})
export class AppTranslationModule {
  constructor(private translate: TranslateService, private sharedService: SharedService) {
    // translate.addLangs(['en', 'ja']);
    // translate.setDefaultLang('en');
    // const lang = this.sharedService.getLang();
    // try {
    //   if (lang != null && lang !== undefined) {
    //     if (lang.length === 2) {
    //       translate.use(lang);
    //     } else {
    //       translate.use('en');
    //     }
    //   } else { translate.use('en'); }
    // } catch (e) {
    //   console.error(e);
    // }
  }
}

