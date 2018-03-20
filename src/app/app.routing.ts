import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Import Containers
import {
  FullLayoutComponent,
  SimpleLayoutComponent
} from './containers';
import { MonitorComponent } from 'app/views/monitor/monitor.component';
import { EcgSessionComponent, DataComponent } from 'app/views/data/';
import { SettingComponent } from './views/setting/setting-component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  {
    path: '',
    component: FullLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: './views/dashboard/dashboard.module#DashboardModule'
      },
      {
        path: 'monitor',
        component: MonitorComponent
      },
      {
        path: 'data',
        component: DataComponent,
      },
      {
        path: 'session/:datasetId/:param',
        component: EcgSessionComponent
      },
      {
        path: 'settings',
        component: SettingComponent
      },

    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
