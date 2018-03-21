import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SettingComponent } from './views/setting/setting-component';
import { NgxSelectModule } from 'ngx-select-ex';
// Import containers
import {
  FullLayoutComponent,
  SimpleLayoutComponent
} from './containers';

const APP_CONTAINERS = [
  FullLayoutComponent,
  SimpleLayoutComponent
]

// Import components
import {
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV
} from './components';

const APP_COMPONENTS = [
  AppAsideComponent,
  AppBreadcrumbsComponent,
  AppFooterComponent,
  AppHeaderComponent,
  AppSidebarComponent,
  AppSidebarFooterComponent,
  AppSidebarFormComponent,
  AppSidebarHeaderComponent,
  AppSidebarMinimizerComponent,
  APP_SIDEBAR_NAV
]

// Import directives
import {
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
} from './directives';

const APP_DIRECTIVES = [
  AsideToggleDirective,
  NAV_DROPDOWN_DIRECTIVES,
  ReplaceDirective,
  SIDEBAR_TOGGLE_DIRECTIVES
]

// Import routing module
import { AppRoutingModule } from './app.routing';
// Import 3rd party components
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { SerivceModule } from 'app/services/service.module';
import { MonitorComponent } from './views/monitor/monitor.component';
import { RealtimeChartComponent } from './views/monitor/realtime-chart/realtime-chart.component';
import { EcgChartComponent } from 'app/components/ecg-chart/ecg-chart.component';
import {
  DataComponent, EcgSessionComponent, HeartRateChartComponent,
  EcgStaticChartComponent, PostureChartComponent
} from 'app/views/data/';
import { MyCalendarComponent, CalendarTypeComponent } from './components/';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { ChartModule } from 'angular2-highcharts';
import { CalendarModule } from 'angular-calendar';
// busy
// import { BusyModule, BusyConfig } from 'angular2-busy';

import { AppTranslationModule } from './app.translation.module';
declare var require: any;
export function highchartsFactory() {
  return require('highcharts');
}
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ChartsModule,
    ChartModule, // for highchart
    SerivceModule,
    AppTranslationModule,
    FormsModule,
    CalendarModule.forRoot(),
    // BusyModule
    NgxSelectModule
  ],
  declarations: [
    AppComponent,
    ...APP_CONTAINERS,
    ...APP_COMPONENTS,
    ...APP_DIRECTIVES,
    MonitorComponent,
    EcgChartComponent,

    CalendarTypeComponent,
    MyCalendarComponent,

    DataComponent,
    EcgSessionComponent,
    HeartRateChartComponent,
    EcgStaticChartComponent,
    PostureChartComponent,

    SettingComponent,
    
    RealtimeChartComponent,
  ],
  providers: [{
    provide: LocationStrategy,
    useClass: HashLocationStrategy,
  },
  {
    provide: HighchartsStatic,
    useFactory: highchartsFactory
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
