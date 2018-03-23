import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Device, IOTService, SharedService, AlarmSetting, Gateway, DataService, Dataset } from 'app/services';
import { EcgChartComponent } from 'app/components/ecg-chart/ecg-chart.component';
import { Subscription } from 'rxjs/Subscription';
import * as requestInterval from 'request-interval';
// import * as azureStorage from 'azure-storage';
// var azure = require('azure-storage');
@Component({
  selector: 'realtime-chart',
  templateUrl: './realtime-chart.component.html',
  styleUrls: ['./realtime-chart.component.scss', './slider.scss']
})
export class RealtimeChartComponent implements OnInit, OnDestroy {
  @ViewChild(EcgChartComponent) ecgChartComponent: EcgChartComponent;
  @Input() device: Device;
  @Input() gateway: Gateway;
  data: any[] = [];
  iotSubscription: Subscription;

  heartrate = 0;
  isSensor = false;
  battery = -1;
  batteryInt = -1;

  temperature = 0;
  posture = -1;
  rssi = -1000;
  rssiImageSrc = 'assets/img/rssi-no.png';
  postureImageSrc = 'assets/img/user-what-red.png';

  isFlashDisconnected = false;
  setting: AlarmSetting = new AlarmSetting();

  constructor(
    private iotService: IOTService,
    private sharedService: SharedService,
    private dataService: DataService) { }
  isRecord = false;
  preIsSensor = false;
  ngOnInit() {

    this.setting = this.sharedService.getAlarmSetting();
    this.postureImageSrc = this.getPostureImg();
    this.recordDataset = this.sharedService.getRecordingStatus(this.device._id);
    this.isRecord = this.device.isRecord;
    if (this.recordDataset == null && this.isRecord) {
      // this.isRecord = false;
    }

    this.iotSubscription = this.iotService.dataListner().subscribe(data => {
      if (data.emitter_mac === this.device.mac) {
        // console.log(`${data.emitter_mac}: data received`, data);
        this.ecgChartComponent.push(data.ecg);
        this.heartrate = data.heartrate.length > 0 ? data.heartrate[0] : 0;
        this.isSensor = data.isSensor;

        if (!this.isSensor) {
          if (this.preIsSensor) {
            this.playAudioSensor();
          }
        }
        this.preIsSensor = this.isSensor;

        this.temperature = data.temperature;
        this.battery = data.battery / 10;
        this.batteryInt = Math.round(data.battery / 10);
        this.posture = data.posture;
        switch (this.posture) {
          case 1:
            this.postureImageSrc = 'assets/img/user-down.png';
            break;
          case 0:
            this.postureImageSrc = 'assets/img/user-up.png';
            break;
          case 2:
            this.postureImageSrc = 'assets/img/user-walk.png';
            break;
          default:
            this.postureImageSrc = this.getPostureImg();
        }
        this.rssi = data.rssi;
        this.rssi = Math.round(100 * (127 + this.rssi) / (127 + 20));
        if (this.rssi < 0) {
          this.rssiImageSrc = 'assets/img/rssi-no.png';
        } else if (this.rssi < 20) {
          this.rssiImageSrc = 'assets/img/rssi-1.png';
        } else if (this.rssi < 40) {
          this.rssiImageSrc = 'assets/img/rssi-2.png';
        } else if (this.rssi < 60) {
          this.rssiImageSrc = 'assets/img/rssi-3.png';
        } else if (this.rssi < 80) {
          this.rssiImageSrc = 'assets/img/rssi-4.png';
        } else {
          this.rssiImageSrc = 'assets/img/rssi-5.png';
        }
      }
    });
    // setTimeout(this.simulate(), 40);
    //  requestInterval(190, () => {
    //   this.simulate();
    // });
  }
  soundPosture() {
    if (!this.setting.isAlarmPosture) {
      return;
    }
    if (!this.setting.isPostureSound) {
      return;
    }
    const audio = new Audio();
    audio.src = 'assets/mp3/2.mp3';
    audio.load();
    audio.play();
  }
  getPostureImg(): string {
    if (!this.setting.isAlarmPosture) {
      return 'assets/img/user-what.png';
    }
    if (!this.setting.isPostureFlash) {
      return 'assets/img/user-what.png';
    }
    return 'assets/img/user-what-red.png';
  }

  recordDataset: Dataset;
  onSwitchRecord() {
    if (this.isRecord) {
      this.recordDataset = new Dataset();
      this.recordDataset.start = new Date().getTime();
      this.recordDataset.gatewayId = this.gateway._id;
      this.recordDataset.deviceId = this.device._id;
      this.recordDataset.datasetId = `${this.device._id}${this.recordDataset.start}`;
      this.recordDataset.file = `${this.device._id}_${this.recordDataset.start}`;
      this.dataService.startRecord(this.recordDataset)
        .subscribe(res => {
          this.sharedService.setRecordingStatus(this.device._id, this.recordDataset);
          console.log(res);
        })
    } else {
      if (this.recordDataset == null) {
        console.log('cancel Record')
        this.dataService.cancelRecord(this.device._id)
          .subscribe(res => {
            console.log(res);
          })
        return;
      }
      this.recordDataset.duration = new Date().getTime() - this.recordDataset.start;
      this.dataService.stopRecord(this.recordDataset)
        .subscribe(res => {
          console.log(res);
        })
    }
  }
  simulate() {
    var ecg = [1, 100, 300, 900, 1000, 1500, 1750, 2000, 2250, 2500];
    this.ecgChartComponent.push(ecg);
  }
  ngOnDestroy() {
    this.sharedService.setRecordingStatus(this.device._id, this.recordDataset);
    this.iotSubscription.unsubscribe();

  }
  playAudioSensor() {
    if (!this.setting.isAlarmSensorOff) {
      return;
    }
    if (!this.setting.isSensorSound) {
      return;
    }
    const audio = new Audio();
    audio.src = 'assets/mp3/2.mp3';
    audio.load();
    audio.play();
  }
  playAudioDisconnect() {
    if (!this.setting.isAlarmDisconnect) {
      return;
    }
    if (!this.setting.isDisconnectSound) {
      return;
    }
    const audio = new Audio();
    audio.src = 'assets/mp3/2.mp3';
    audio.load();
    audio.play();
  }
  flashDisconnect() {
    if (!this.setting.isAlarmDisconnect) {
      return;
    }
    if (!this.setting.isDisconnectFlash) {
      return;
    }
    this.isFlashDisconnected = true;
  }
  statusChanged(isConnected: number) {
    if (!isConnected) {
      this.playAudioDisconnect();
      this.flashDisconnect();
    } else {
      this.isFlashDisconnected = false;
    }
  }
}
