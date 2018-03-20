import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { CommonModule } from '@angular/common';
import { MaSlidePopupComponent } from 'app/components/ma-slide-popup/ma-slide-popup.component';
import { GatewayEditorComponent } from './gateway-editor/gateway-editor.component';
import { DeviceEditorComponent } from './device-editor/device-editor.component';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ChartsModule,
    ModalModule.forRoot(),
    BsDropdownModule,
    FormsModule
  ],
  declarations: [ DashboardComponent, MaSlidePopupComponent, GatewayEditorComponent, DeviceEditorComponent ]
})
export class DashboardModule { }
