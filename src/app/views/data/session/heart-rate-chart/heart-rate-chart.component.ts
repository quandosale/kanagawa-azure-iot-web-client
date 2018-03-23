import { FileType } from '../../../../common/FileType';
import { Component, OnInit, Output, EventEmitter, Input, AfterViewInit, ElementRef } from '@angular/core';
import { GatewayService, SharedService } from '../../../../services/index';
import { environment } from '../../../../../environments/environment';
declare let $: any;
@Component({
  selector: 'heart-rate-chart',
  templateUrl: './heart-rate-chart.component.html',
  styleUrls: ['./heart-rate-chart.component.scss']
})

export class HeartRateChartComponent implements OnInit, AfterViewInit {

  @Input() dataSetId: String;
  @Input() dataSetTime: string;

  @Input() accSeekbar: number;
  @Input() scope: number;
  totalTime: number;

  @Output() hrClicked = new EventEmitter<number>();

  // flag For received from server

  isBusy = true;
  isError = false;

  // max and rest Heart Rate
  maxHeartRate = 0;
  restHeartRate = 200;

  plot: any;
  plotDataSet: any;
  plotLegend: any;
  plotDataSetLegend: any;
  heartRateData: any;
  AFData: any;
  AFRangeData: any;


  timeBegin = 0;
  pointCounter = 0;
  timelinePosition = -1;
  MinHR = 60;
  age = 40;
  constructor(private gatewayService: GatewayService, public elNode: ElementRef, private sharedService: SharedService,
  ) { }

  updateAF(data) {

    this.AFData = [];
    for (let i = 0; i < data.length; i++) {
      let index = data[i];

      this.AFData.push([index * this.hrStep, this.getHeartRateByIndex(index)]);
    }
    console.log('hr af', data, this.AFData, this.heartRateData.length, this.heartRateData, this.hrStep);
    this.update();
  }
  selectedDataSet: any;
  ngOnInit() {
    this.selectedDataSet = this.sharedService.getSelectedDataSet();
    this.getStorageFile(true);
  }
  getStorageFile(isInflate: boolean) {
    // const url = `${environment.API_URL}/dataset/download/${this.selectedDataSet.file}${FileType.HEART_RATE_EN}`;
    const url = `${environment.STORAGE_URL}/${this.selectedDataSet.file}${FileType.HEART_RATE_EN}?${environment.STORAGE_ACCOUNT_SAS}`;
    this.downloadFileWithInflate(url);

  }
  downStart = 0;
  downloadFile(url) {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    // xhr.responseType = 'blob';
    const self = this;
    xhr.onload = function (event) {
      const blob: string = xhr.response;
      // console.warn(blob)
      // let duration = new Date().getTime() - self.downStart;
      // let lineCount = (blob.match(/\n/g) || []).length;
      self.isBusy = false;
      self.anaylsysData(blob);

    };
    xhr.onprogress = function (e) {
      // console.log("hr progress", e);
    };
    xhr.open('GET', url);
    xhr.send();
    // window.open(url)
  }
  downloadFileWithInflate(url) {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    const self = this;
    xhr.onload = function (event) {
      const blob: ArrayBuffer = xhr.response;
      console.log('hr blob', blob)
      self.isBusy = false;
      self.anaylsysDataBinayry(blob);
    };
    xhr.onprogress = function (e) {
      // self.percent = `${Math.floor(100 * e.loaded / e.total)} %`;
    };
    xhr.open('GET', url);
    xhr.send();
    // window.open(url)
  }
  TAG = "hrdebug";
  hrStep = 0;
  anaylsysData(str: string) {
    // console.warn("analysisData", str)
    // let arr = str.match(/\r\n/g) || [];
    let arr1 = str.split("\r\n");
    // console.warn("analysisData", arr.length, arr[7])

    let numberArr = arr1.map(function (item) {
      if (!isNaN(parseInt(item)))
        return Math.min(parseInt(item), 180);
      else return 0;
    });

    // this.totalTime = numberArr.length * 4;
    // this.queue = numberArr;
    // alert(this.queue.length)

    let dateTime = new Date(this.dataSetTime);
    this.timeBegin = dateTime.getTime();

    this.heartRateData = [];
    let data = numberArr;

    let heartFirst = 0;
    if (data.length > 0) {
      // heartFirst = data[0];
    }
    for (let i = 0; i < data.length; i++) {
      data[i] = this.filterHR(data[i]);
    }
    // this.heartRateData.push([0, heartFirst])
    this.totalTime = 100000;
    this.hrStep = Math.floor(this.totalTime / data.length);
    for (let i = 0; i < data.length; i++) {
      this.heartRateData.push([(i) * this.hrStep, this.transformHR(data[i])]);
    }

    this.update();
  }
  unit8ArrTo16Arr(arrByte: ArrayBuffer) {
    const arr = new Uint8Array(arrByte);
    const length = arr.byteLength;
    const result = [];
    for (let i = 0; i < length / 2; i++) {
      const item = (arr[i * 2]) + ((arr[i * 2 + 1]) * 256);
      result.push(item);
    }
    return result;
  }
  anaylsysDataBinayry(binaryblob: ArrayBuffer) {
    // // Pako magic
    // const byteArrayInflated = pako.inflate(binaryblob);
    const data = this.unit8ArrTo16Arr(binaryblob);
    this.heartRateData = [];

    const heartFirst = 0;
    if (data.length > 0) {
      // heartFirst = data[0];
    }
    for (let i = 0; i < data.length; i++) {
      data[i] = this.filterHR(data[i]);
    }
    // this.heartRateData.push([0, heartFirst])
    this.totalTime = 100000;
    this.hrStep = Math.floor(this.totalTime / data.length);
    for (let i = 0; i < data.length; i++) {
      this.heartRateData.push([(i) * this.hrStep, this.transformHR(data[i])]);
    }

    this.update();
  }
  ngAfterViewInit() {
    this.plot = $(this.elNode.nativeElement).find('#hrtgraph').empty();
    this.plotLegend = $(this.elNode.nativeElement).find('#hrtgraph-legend').empty();


    const boundaryColor = $('#hrtgraph').css('background-color');
    const boundary = [];
    boundary.push([0, 0]);
    boundary.push([1000, 0]);
    boundary.push([1000, 200]);
    boundary.push([0, 200]);
    boundary.push([0, 0]);

    this.plotDataSet = [{ color: boundaryColor, data: boundary }];
    $.plot(this.plot, this.plotDataSet, this.getOption());

    this.plotDataSetLegend = [
      // { color: '#FD2503', data: [], label: 'Maximum' }, // #EB550C
      // { color: '#ff9306', data: [], label: 'Hard' }, // #EB550C
      // { color: '#C4C206', data: [], label: 'Cardio' }, // #EB550C
      // { color: '#64A004', data: [], label: 'Fat Burn' }, // #EB550C
      // { color: '#acaeaf', data: [], label: 'Warm Up' }, // #EB550C
      // { color: '#537536', data: [], label: 'Rest' } // #

    ];
    $.plot(this.plotLegend, this.plotDataSetLegend, this.getOption());


    $(this.elNode.nativeElement)
      .on('plotclick', (event: any, pos: any, item: any) => {
        this.plotClick(pos.x.toFixed(2));
      });
    // $(this.elNode.nativeElement)
    //   .on('plothover', (event: any, pos: any, item: any) => {
    //     this.plotHover(pos.x.toFixed(2), pos.y.toFixed(2), item);
    //   });


  } // ngAfterViewInit
  test() {
    this.pointCounter = 0;
    // let data = res.data.data;
    let data = [[0, 30]];
    for (let i = 0; i < 180; i++) {
      let value = Math.random() * 10 + 70;
      let duration = Math.random() * 100 + 20;
      data.push([value, duration]);

    }

    this.heartRateData = [];
    let pointSum = 0;

    // calculate total sum , max heartrate , rest heartrate
    for (let i = 0; i < data.length; i++) {
      pointSum = pointSum + data[i][1] * 1000;
      if (this.maxHeartRate < data[i][0]) {
        this.maxHeartRate = data[i][0];
      }
      if (this.restHeartRate > data[i][0] && data[i][0] >= 40) {
        this.restHeartRate = data[i][0];
      }
    }

    // prepare for HeartRate Data (buffer)
    for (let i = 0; i < data.length; i++) {
      let time = this.pointCounter * this.totalTime / pointSum;
      time = Math.floor(time);
      this.heartRateData.push([time, data[i][0]]);
      this.pointCounter += data[i][1] * 1000;
    }
    let time = this.pointCounter * this.totalTime / pointSum;
    time = Math.floor(time);
    this.heartRateData.push([time, data[data.length - 1][0]]);
    this.update();

  }
  plotHover(x: number, y: number, item: any) {
    if (item === null) {
      return;
    }
    // let __x = item.datapoint[0].toFixed(2),
    let __y = item.datapoint[1].toFixed(2);
    x = Math.max(0, x);
    x = Math.min(x, this.totalTime);

    let str = this.msToTime(x);
    let tooltip = $(this.elNode.nativeElement).find('#tooltip');
    tooltip.text(str);
    tooltip.css({
      top: 150 - __y / 2,
      left: x / this.totalTime * this.plot.width()
    });
    console.log(item);
    if (item) {
      tooltip.fadeIn(200);
      setTimeout(() => { tooltip.hide(); }, 2000);
    } else {

      tooltip.hide();
    }

  }
  onHrtResize(vl: any): void {
    $.plot(this.plot, this.plotDataSet, this.getOption());
    $.plot(this.plotLegend, this.plotDataSetLegend, this.getOption());
  }

  getOption() {
    const MaxHR = 220 - this.age;

    const min = (+ 0.4 * MaxHR);
    const max = (MaxHR);

    // setMaxHeight(max - min);
    const result = {
      isLineGradient: true,
      xaxis:
        {
          show: false,
          mode: 'time',
          minTickSize: [1, 'minute'],
          timeformat: '%H:%M',
          min: 0,
          tickColor: '#B8E5FB',
          max: this.totalTime
        },
      yaxis: {
        show: false,
        min: 0,
        max: 90, // (max - min),
        datamin: 0,
        datamax: 90, // (max - min),
        tickColor: '#B8E5FB',
        autoscaleMargin: 0,
        labelWidth: 20
      },
      series: {
        color: 'red',
        shadowSize: 0,
      },
      legend: {
        isHeartRate: true,
        backgroundOpacity: 0,
        position: 'ws'
      },
      splines: { show: true, tension: 0.3, lineWidth: 2, fill: 1 },
      grid: {
        isHeartRateChart: true,
        show: true,
        borderColor: '#FFFFFF',
        hoverable: true,
        clickable: true,
        timelinePosition: this.timelinePosition
      },
    };
    return result;
  }
  preX = -1;
  update() {
    let ecgSeek = [];
    // this.AFData = [[1,100],[2,200]];
    // this.AFData = [];
    // for (var i = 0; i < 100; i++) {
    //   this.AFData.push(i*10, 70);
    // }
    let x = this.totalTime * (this.accSeekbar) / 1500;
    x = x * (this.totalTime - this.scope) / this.totalTime;
    x = Math.floor(x);

    if (this.preX == x) {
      setTimeout(() => { this.update(); }, 100);
      return;
    }
    this.preX = x;

    let deltaX = Math.max(this.scope, 2000);
    ecgSeek.push([x, 0]);
    ecgSeek.push([x + deltaX, 0]);
    ecgSeek.push([x + deltaX, 200]);
    ecgSeek.push([x, 200]);
    ecgSeek.push([x, 0]);

    this.plotDataSet = [
      {
        gradient: [
          { at: 0, color: '#FD2503' },
          { at: 0.2, color: '#ff9306' },
          { at: 0.5, color: '#C4C206' },
          { at: 0.78, color: '#64A004' },
          { at: 0.9, color: '#acaeaf' }
        ],
        data: this.heartRateData,
        splines: {
          show: true
        }
      }, // #EB550C
      {
        color: '#9AF11D', data: ecgSeek,
        lines: {
          lineWidth: 1.0, show: true, fill: true,
          fillColor: {
            colors: [{ opacity: 0.5 }, { opacity: 0.5 }]
          }
        }
      },
      {
        color: 'blue',
        data: this.AFData,
        // splines: {
        //   show: true
        // },
        points: {
          show: true,
          radius: 1,
          lineWidth: 1, // in pixels
          fill: true,
          fillColor: '#00ffff',
          symbol: 'circle' // or callback
          // symbol: 'af' // or callback
        },
        lines: {
          show: false
        },
      }
    ];

    $.plot(this.plot, this.plotDataSet, this.getOption());
    setTimeout(() => { this.update(); }, 100);
  }

  msToTime(x: any) {
    // let ms = x % 1000;
    x = x / 1000;
    x = Math.floor(x);
    const secs = x % 60;
    const secsStr = ('00' + secs).substr(-2);
    x = x / 60;
    x = Math.floor(x);
    const mins = x % 60;
    const minsStr = ('00' + mins).substr(-2);
    x = x / 60;
    x = Math.floor(x);
    const hours = x;
    const hoursStr = ('00' + hours).substr(-2);
    return hoursStr + ':' + minsStr + ':' + secsStr;
  }
  // BEGIN heart rate filter
  HR_N = 3;
  filterHR_I = 0;
  prevHr = [3];

  filterHR(hr: number): number {
    this.filterHR_I++;

    this.prevHr[(this.filterHR_I - 1) % this.HR_N] = hr;
    if (this.filterHR_I < this.HR_N) { return hr; }

    let res = 0;
    for (let i = 0; i < this.HR_N; i++) {
      res += (this.prevHr[i] / this.HR_N);
    }
    return res;
  }
  // END heart rate filter

  transformHR(hr: number): number {
    const MaxHR = 220 - this.age;

    const min = 0.4 * MaxHR;
    const max = MaxHR;
    if (hr > max) { return min; }
    if (hr < min) { return 0; }
    return hr - min;
  }

  getHeartRateByIndex(index: number): number {
    if (this.heartRateData == null) { return 0; }
    for (let i = 1; i < this.heartRateData.length; i++) {
      if (this.heartRateData[i][0] > index) {
        let prev = this.heartRateData[i - 1][0];
        let cur = this.heartRateData[i][0];
        let width = cur - prev;
        let prevHr = this.heartRateData[i - 1][1];
        let curHr = this.heartRateData[i][1];
        width = Math.max(1, width);
        let hrPerX = (curHr - prevHr) / width;
        let hr = (index - prev) * hrPerX + prevHr;
        return hr;
      }
    }
    return 0;
  }
  onMouseMove(event: any) {
    // let pos = event.clientX - this.plot.offset().left - this.getOption().yaxis.labelWidth + 11;
    // this.timelinePosition = pos;
    // $.plot(this.plot, this.plotDataSet, this.getOption());
  }
  onMouseLeave(event: any) {
    this.timelinePosition = -1;
    $.plot(this.plot, this.plotDataSet, this.getOption());
  }
  plotClick(value: number) {
    if (this.totalTime !== 0) {
      let v = (value) * 1500 / this.totalTime;
      v = Math.round(v);
      this.hrClicked.emit(v);
      this.update();
    }
  }
}
