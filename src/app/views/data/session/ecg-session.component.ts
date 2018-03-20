import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
// Router library
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
// services
import { GatewayService } from '../../../services/index';

declare var $: any;
import { FileType } from './../../../common/FileType';

import { EcgStaticChartComponent } from './ecg-chart/ecg-static-chart.component';
import { HeartRateChartComponent } from './heart-rate-chart/heart-rate-chart.component';
import { Meta, Title } from '@angular/platform-browser';
@Component({
  selector: 'ecg-session-view',
  templateUrl: './ecg-session.component.html',
  styleUrls: ['./ecg-session.component.scss', './ss.scss']
})

export class EcgSessionComponent implements OnInit, OnDestroy {

  dataSetId = '';
  date = '';
  timezone: Number[] = null;
  private sub: any;
  startTime = '00:00';

  sessionDuration = '00:00:00';
  restHeartRate = 0;
  maxHeartRate = 0;
  isEnableAF = false;
  isShowAF = false;
  isSuccess = false;
  @ViewChild(EcgStaticChartComponent) ecgChartComponent: EcgStaticChartComponent;
  @ViewChild(HeartRateChartComponent) hrChartComponent: HeartRateChartComponent;

  findIndex(Data, dataset): number {
    for (let i = 0; i < Data.length; i++) {
      if (Data[i].datasetId === dataset.datasetId) {
        return i;
      }
    }
    return -1;
  }
  ngOnInit() {
    // this.downloadFile();
    this.getAFStorageFile();
  }
  isNotEnoughAF = false;
  getAFStorageFile() {
    const url = 'https://firebasestorage.googleapis.com/v0/b/calm-172003.appspot.com/o/dataset%2FIz27LOXpSvXlbpjjhDocm00PD383%2F20180118_041146_0_1610736%2F20180118_041146_af.dat?alt=media&token=083ce9f1-74fd-4fb0-9acf-ebda84e440a2';
    this.downloadFileWithInflate(url);

  }
  downloadFileWithInflate(url) {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    const self = this;
    xhr.onload = function (event) {
      const blob: ArrayBuffer = xhr.response;
      self.anaylsysDataBinayry(blob);
    };
    xhr.onprogress = function (e) {
      // self.percent = `${Math.floor(100 * e.loaded / e.total)} %`;
    };
    xhr.open('GET', url);
    xhr.send();
  }
  unit8ArrTo32Arr(arrByte: ArrayBuffer) {
    const arr = new Uint8Array(arrByte);
    const length = arr.byteLength;
    const result = [];
    for (let i = 0; i < length / 4; i++) {
      const item = (arr[i * 4]) +
        ((arr[i * 4 + 1]) * Math.pow(2, 8)) +
        ((arr[i * 4 + 2]) * Math.pow(2, 16)) +
        ((arr[i * 4 + 3]) * Math.pow(2, 24));
      result.push(item);
    }
    return result;
  }
  af_index_ecg = [];
  af_index_hr = [];
  anaylsysDataBinayry(binaryblob: ArrayBuffer) {
    // // Pako magic
    // const byteArrayInflated = pako.inflate(binaryblob);
    const data = this.unit8ArrTo32Arr(binaryblob);
    console.log('af,', data)
    for (var i = 0; i < data.length / 2; i++) {
      this.af_index_ecg.push(data[2 * i]);
      this.af_index_hr.push(data[2 * i + 1]);
    }


    this.isEnableAF = true;
  }
  
  tapShowAF() {
    if (this.isShowAF) {
      this.ecgChartComponent.updateAF(this.af_index_ecg);
      this.hrChartComponent.updateAF(this.af_index_hr);
    } else {
      var empty = [];
      this.ecgChartComponent.updateAF(empty);
      this.hrChartComponent.updateAF(empty);
    }
  }
  durationFormat(mili: number): string {
    let x = mili > 0 ? mili : 0;
    // let ms = x % 1000;
    x = x / 1000;
    x = Math.floor(x);
    const secs = x % 60;

    let secsStr = '';
    if (secs < 10) {
      secsStr = '0' + secs;
    } else {
      secsStr = '' + secs;
    }

    x = x / 60;
    x = Math.floor(x);
    const mins = x % 60;

    let minsStr = '';
    if (mins < 10) {
      minsStr = '0' + mins;
    } else {
      minsStr = '' + mins;
    }

    x = x / 60;
    x = Math.floor(x);

    let hoursStr = '';
    if (x < 10) {
      hoursStr = '0' + x;
    } else { hoursStr = '' + x; }
    return hoursStr + ':' + minsStr + ':' + secsStr;
  }

  startTimeFormat(data): string {
    const date = new Date(data);
    const dateTime = new Date(date);

    let hour = dateTime.getHours();
    const minute = dateTime.getMinutes();
    const min = (minute / 10 >= 1) ? minute : ('0' + minute);
    const second = dateTime.getSeconds();
    const ss = (second / 10 >= 1) ? second : ('0' + second);
    // const ampm = hour < 12 ? 'AM' : 'PM';
    // hour = hour % 12;
    const hh = (hour / 10 >= 1) ? hour : ('0' + hour);
    const result = `${hh}:${min}`;

    return result;
  }
  constructor(private gatewayService: GatewayService, private route: ActivatedRoute,
    private _location: Location,
    public meta: Meta,
    public title: Title) { }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }

  backClicked() {
    this._location.back();
  }
}
