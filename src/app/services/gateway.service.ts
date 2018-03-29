import { Injectable } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GatewayService {

    constructor(private apiService: ApiService) { }

    getGateways(): Observable<any> {
        return this.apiService.get('/gateways');
    }

    getNewGatewayFirmwareVersion(): Observable<any> {
        return this.apiService.get('/iot/firmware-version');
    }

    deleteGateway(deviceId: string): Observable<any> {
        return this.apiService.delete(`/gateways/${deviceId}`);
    }

    updateGateway(gateway: Gateway) {
        console.log(gateway);
        return this.apiService.put('/gateways', { gateway: gateway });
    }
}

export class Device {
    isRecord: boolean = false;
    type: string = 'CALM-ECG';
    mac: string;
    deviceName: string;
    name: string;
    gatewayID: string;
    _id: string;
}

export class Gateway {
    _id: string;
    name: string;
    deviceId: string;
    deviceKey: string;
    devices: Device[];
    firmware: string;
}
