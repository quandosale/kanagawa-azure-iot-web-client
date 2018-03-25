import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { ApiService } from 'app/services/api.service';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';
import { MitBit } from './MitBit';
const keys = Object.keys;
@Injectable()
export class IOTService {
  ws: WebSocket;

  iotData = new Subject<iotData>();

  constructor(private apiService: ApiService) { }

  sendCloudToDeviceMessage(deviceId: string, methodName: string, data: any): Observable<any> {
    return this.apiService.post(`/iot/direct-method/`, {
      deviceId: deviceId,
      methodName: methodName,
      data
    });
  }

  analysis(data) {
    // parse ecg
    const ecg_buf = data.row.ecg;
    const sensor = data.row.isSensor;
    const hr_buf = data.row.heartrate.data;
    const battery = data.row.battery;
    const temperature = data.row.temperature;
    const pos = data.row.pos;
    const rssi = data.row.rssi;
    const ecgArr = MitBit.buffer12ToArray(ecg_buf.data);
    const hrArr = MitBit.buffer12ToArray(hr_buf);
    const iot_tmp = new iotData();
    iot_tmp.duration = ecgArr.length / 250; // convert second
    iot_tmp.emitter_mac = data.row.emitter;
    iot_tmp.ecg = ecgArr;
    iot_tmp.isSensor = sensor;
    iot_tmp.heartrate = hrArr;
    iot_tmp.temperature = temperature;
    iot_tmp.battery = battery;
    iot_tmp.posture = pos;
    iot_tmp.rssi = rssi;
    this.iotData.next(iot_tmp);

  }

  listenMessages() {
    if (this.ws) {
      if (this.ws.readyState == this.ws.OPEN)
        this.ws.close();
    }
    this.ws = new WebSocket('wss://kanagawa-web.azurewebsites.net');
    this.ws.onopen = function () {
      console.log('Successfully connect WebSocket');
    }
    this.ws.onmessage = (message) => {
      try {
        const obj = JSON.parse(message.data);

        if (obj.TAG === 'ECG') {
          // Received ECG Data
          this.analysis(obj.data);
        }

        if (obj.TAG === 'For Socket Debug') {
          //  console.log(obj);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const self = this;
    this.ws.onclose = (msg) => {
      try {
        console.log('Web Socket closed');
        console.log('Try Reconnecting ...');

        self.listenMessages();
      } catch (err) {
        console.error(err);
      }
    };
  }


  dataListner() {
    return this.iotData.asObservable();
  }
}

export class iotData {
  emitter_mac: string;
  ecg: number[];
  isSensor: boolean;
  heartrate: number[];
  battery: number;
  temperature: number;
  duration: number;
  posture: number;
  rssi: number;
};
