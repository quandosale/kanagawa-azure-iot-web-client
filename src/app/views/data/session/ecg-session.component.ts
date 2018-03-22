import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
// Router library
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
// services
import { GatewayService, SharedService } from '../../../services/index';

declare var $: any;
import { FileType } from './../../../common/FileType';
import { environment } from '../../../../environments/environment';
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
    this.selectedDataSet = this.sharedService.getSelectedDataSet();
    this.selectedDataSet.dateStr = this.dateFormat(this.selectedDataSet.start);
    this.getAFStorageFile();
  }
  // convert date to Formatted String
  dateFormat(date: Date): String {
    const dateTime = new Date(date);
    const yyyy = dateTime.getFullYear();
    const month = dateTime.getMonth() + 1;
    const mm = (month / 10 >= 1) ? month : ('0' + month);
    const day = dateTime.getDate();
    const dd = (day / 10 >= 1) ? day : ('0' + day);

    const hour = dateTime.getHours();
    const hh = (hour / 10 >= 1) ? hour : ('0' + hour);
    const minute = dateTime.getMinutes();
    const min = (minute / 10 >= 1) ? minute : ('0' + minute);
    const second = dateTime.getSeconds();
    const ss = (second / 10 >= 1) ? second : ('0' + second);

    const result: String = `${mm}/${dd}/${yyyy} ${hh}:${min}:${ss}`;
    return result;
  }
  isNotEnoughAF = false;
  selectedDataSet: any;
  getAFStorageFile() {
    const url = `${environment.API_URL}/dataset/download/${this.selectedDataSet.file}${FileType.AF}`;
    this.downloadFileWithInflate(url);
  }
  downloadFileWithInflate(url) {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    const self = this;
    xhr.onload = function (event) {
      const text = xhr.response;
      self.anaylsysDataBinayry(text);
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
  anaylsysDataBinayry(str) {
    let arr1 = str.split(',');
    // console.warn("analysisData", arr.length, arr[7])

    let numberArr = arr1.map(function (item) {
      if (!isNaN(item))
        return parseInt(item);
      else return 0;
    });
    console.log('af,', numberArr)
    for (var i = 0; i < numberArr.length / 2; i++) {
      this.af_index_ecg.push(numberArr[2 * i]);
      this.af_index_hr.push(numberArr[2 * i + 1]);
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
  constructor(
    private sharedService: SharedService,
    private gatewayService: GatewayService,
    private route: ActivatedRoute,
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
