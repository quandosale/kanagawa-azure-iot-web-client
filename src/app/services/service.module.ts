import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { GatewayService } from 'app/services';
import { IOTService } from 'app/services/iot.service';
import { SharedService } from './shared.services';
import { DataService } from './data.services';
@NgModule({
    imports: [
        HttpModule
    ],
    exports: [],
    declarations: [],
    providers: [
        ApiService,
        GatewayService,
        IOTService,
        SharedService,
        DataService
    ],
})
export class SerivceModule { }
