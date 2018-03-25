import { AFSet } from './../../../../services/AccData';
import { FileType } from './../../../../common/FileType';
import { environment } from '../../../../../environments/environment';
import {
  Component, OnInit, AfterViewInit,
  Input, ElementRef, OnDestroy, Output, EventEmitter
} from '@angular/core';
import { GatewayService, SharedService, MitBit } from '../../../../services/index';

// import { EcgSimulator } from './ecg-simulate';

declare let $: any;
declare let jQuery: any;
@Component({
  selector: 'ecg-static-chart',
  templateUrl: './ecg-static-chart.component.html',
  styleUrls: ['./ecg-static-chart.component.scss'],
})

export class EcgStaticChartComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() heightzoom = false;
  @Input() dataSetId: String;
  @Input() dataSetTime: string;
  @Output() hrUpdate = new EventEmitter();
  scope = 0;
  percent = null;

  // for mouse hover time
  timelinePosition: number = -1;
  timelineOffset: number = 0;
  selectTime: number = 0;

  height = 0;
  isBusy = true;
  isChrome = false;

  // Plot relative variable
  plot: any;
  plotObject: any;

  plotDataSet: any;
  plotPosInWorld: number = 0;
  // pointCountInPlot: number = 0;
  plotViewPointSet: number[] = [];
  plotSize = 1500;  // this is point count of plot

  // flag for mouse drag of seekbar
  seekbarCaptured: boolean = false;
  isDragged: boolean = false;

  // seekbar variable
  seekbarPosition: number = 0;
  seekbarWidth: number = 1500;

  // stream variable
  streamOffset: number = 0;
  requestStreamSize: number = -1;// -1 = all data, 3000
  AccDataSize: number = 0;

  queue: number[] = [];// array of number (queue)
  queueSize = 60000;
  AFQueue: AFSet[] = [];
  AFsInView: any = [];

  // flag of now playing
  isPlaying: boolean = false;

  zoom = 1;
  speed = 2; // normal 2;
  speedForTime = 1;
  speedMul = 2 * 1;

  bZoomTransform: boolean = false;
  bSeekbarChanged: boolean = false;

  //
  seekbar: any = null;
  seekAutoMove = false;

  //
  timeBegin = 0;
  timeNow: string = '00:00:00';
  timeTotal: string = '00:00:00';
  // data not enough flag
  isNotEnough = false;
  constructor(private gatewayService: GatewayService, private sharedService: SharedService, public elNode: ElementRef) { }
  selectedDataSet: any;

  updateAF(data) {
    this.AFQueue = []
    for (var i = 0; i < data.length; i++) {
      let af_set = new AFSet(data[i], data[i] + 250);
      this.AFQueue.push(af_set);
    }
    this.update();
  }
  getFileVersion() {
    if (this.selectedDataSet.fileVersion != null || this.selectedDataSet.fileVersion !== undefined) {
      return this.selectedDataSet.fileVersion;
    }
    return 0;
  }

  ngOnInit() {
    this.selectedDataSet = this.sharedService.getSelectedDataSet();
    this.getStorageFile(true, true);
    // var ecgSimulator = new EcgSimulator();
    // const fileVersion = this.getFileVersion();
    // if (fileVersion === 1) {
    //   this.getStorageFile(true, false);
    // } else if (fileVersion === 2) {
    //   this.getStorageFile(true, true);
    // } else {
    //   this.getStorageFile(false, false);
    // }
  }

  getStorageFile(isInflate: boolean, isRow: boolean) {
    // const url = `${environment.API_URL}/dataset/download/${this.selectedDataSet.file}${FileType.ECG_EN}`;
    const url = `${environment.STORAGE_URL}/${this.selectedDataSet.file}${FileType.ECG_EN}?${environment.STORAGE_ACCOUNT_SAS}`;
    console.log(url);
    this.downloadEcgFileWithInflate(url, isRow);
  }
  downStart = 0;
  file404Error() {

  }
  downloadEcgFileWithInflate(url, isRow: boolean) {
    // `url` is the download URL for 'images/stars.jpg'

    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    const self = this;
    xhr.onload = function (event) {

      if (xhr.status == 404 || xhr.status == 401) {
        self.isBusy = false;
        self.isNotEnough = true;

        console.error('Cannot find ecg file')
        return;
      }
      const blob: ArrayBuffer = xhr.response;
      console.log('ecg blob', blob)
      self.anaylsysDataBinayry(blob, isRow);
    };
    xhr.onprogress = function (e) {
      self.percent = `${Math.floor(100 * e.loaded / e.total)} %`;
      console.log(self.percent);
    };
    xhr.open('GET', url);
    xhr.send();
  }

  unit8ArrTo16Arr(arrByte: ArrayBuffer, isRow: boolean) {
    const arr = new Uint8Array(arrByte);
    const result = MitBit.buffer12ToArray(arr);
    console.log(result)
    return result;
  }
  anaylsysDataBinayry(binaryblob: ArrayBuffer, isRow: boolean) {
    const data = this.unit8ArrTo16Arr(binaryblob, isRow);

    this.AccDataSize = data.length;
    const dateTime = new Date(this.dataSetTime);
    this.timeBegin = dateTime.getTime();
    this.queue = data;
    if (this.AccDataSize < this.plotSize) {
      this.isNotEnough = true;
    }
    this.update();
  }

  viewInit() {

    this.zoom = 1;
    this.speed = 2;
    this.plot = $(this.elNode.nativeElement).find('#accelerometerGraph').empty();
    this.height = this.plot.height();
    let yRange = 15000;
    let boundary: any = [];
    boundary.push([0, -yRange]);
    boundary.push([1500, -yRange]);
    boundary.push([1500, yRange]);
    boundary.push([0, yRange]);
    boundary.push([0, -yRange]);

    let bgColor = $('#accelerometerGraph').css('background-color');
    this.plotDataSet = [{ color: bgColor, data: boundary }];

    this.plotObject = $.plot(this.plot, this.plotDataSet, this.getOption());

    this.seekbar = $(this.elNode.nativeElement).find('#seekbar');

    this.seekbar.slider({
      range: 'min',
      orientation: 'horizontal',
      animation: true,
      min: 0,
      max: 1500,
      value: 0,
      slide: (event, ui) => { this.seekbarCaptured = true; },
      stop: (event, ui) => { this.seekbarClick(ui.value); }
    });
    // load after viewinit
    this.bZoomTransform = true;
    this.update();
  }


  // load after view init
  ngAfterViewInit(): void {
    this.viewInit();
  }
  nowAccPage = true;
  ngOnDestroy() {
    this.nowAccPage = false;
  }

  getOption(): any {
    let result = {
      series: {
        lines: { show: true },
        shadowSize: 0,	// Drawing is faster without shadows
      },
      xaxis:
        {
          show: false
        },
      yaxis: {
        min: 0,
        max: 4096,
        datamin: 0,
        datamax: 4096,
        labelWidth: 33,
        autoscaleMargin: 0,
        show: false
      },
      legend: {
        backgroundOpacity: 0,
        show: false
      },
      grid: {
        show: true,
        hoverable: false,
        clickable: true,
        timelinePosition: this.timelinePosition,
        timelineOffset: this.timelineOffset,
        selectTime: this.plotPosInWorld,
        timeScale: this.zoom,
        combine: false,
        timeline: true,
        timeIs02second: true, // flag for small grid(0.2second)
        timelinewidth: this.plotSize,
        AFsInView: this.AFsInView
      },
    };
    return result;
  }
  elipse = -1;
  time = 0;
  update() {
    if (this.elipse == -1) {
      this.elipse = new Date().getTime();
    }
    this.time++;
    let duration = new Date().getTime() - this.elipse;

    if (duration > 1000) {
      this.time = 0;
      this.elipse = new Date().getTime();
    }
    if (!this.isPlotFull()) {
      if (this.isNotEnough) { this.isBusy = false; }
      // this.isBusy = true;
      this.PlotDataLoad();
    } else {
      this.isBusy = false;
      if (this.plotPosInWorld < (this.AccDataSize - this.plotSize * this.zoom) && this.queue.length >= this.speedMul * this.zoom) {

        this.bZoomTransform = false;
        this.bSeekbarChanged = false;
        this.scope = this.plotSize * this.zoom;

        let chartData = this.getChartData();
        this.plotDataSet = [
          { label: 'ecg', color: '#008000', data: chartData }
        ];

        this.plotPosInWorld += this.speedMul * this.zoom;
        this.reArrangeAFData();
        $.plot(this.plot, this.plotDataSet, this.getOption());


        if (!this.seekbarCaptured) {
          let percent: number = this.plotPosInWorld / (this.AccDataSize - this.plotSize * this.zoom);
          this.setSeekbar(percent);
          this.setCurrentTime(this.plotPosInWorld);
        }
      }
    }

    if (this.isPlaying || this.bZoomTransform || this.bSeekbarChanged) {
      this.nowUpdate = true;
      if (this.nowAccPage)
        setTimeout(() => { this.update(); }, 0); // tick is 30 millisecond
    } else {
      this.nowUpdate = false;
    }
  }
  nowUpdate = false;
  isPlotFull(): boolean {
    return this.plotViewPointSet.length >= this.plotSize;
  }
  setViewEmpty(): void {
    // this.pointCountInPlot = this.position;
    this.plotViewPointSet = [];
  }
  PlotDataLoad(): void {
    if (this.zoom === 0) { return; }
    let count = 0;
    count = this.queue.length / this.zoom;
    count = Math.floor(count);
    count = Math.min(count, this.plotSize);
    if (count === 0) { return; }
    for (let i = 0; i < count; i++) {
      // this.pointCountInPlot++;
      this.position += this.zoom;
      this.plotViewPointSet.push(this.deQueue(this.zoom));
    }
  }
  preTime = -1;
  getChartData() {
    var now = new Date().getTime();
    if (this.preTime == -1) this.preTime = now;
    var duration = now - this.preTime;
    // var pointAmount = Math.floor(this.speed * 250 * duration / 1000);
    this.speedForTime = Math.floor(duration / 4);
    this.speedForTime = Math.max(this.speedForTime, 1);
    this.speedForTime = Math.min(this.speedForTime, 5);

    this.speedMul = this.speed * this.speedForTime;
    this.preTime = now;
    this.plotViewPointSet = this.plotViewPointSet.slice(this.speedMul);
    for (let i = 0; i < this.speedMul; i++) {
      this.position += this.zoom;
      this.plotViewPointSet.push(this.deQueue(this.zoom));
    }

    let resultE: any = [];

    for (let i = 0; i < this.plotViewPointSet.length; ++i) {
      let e: number = this.plotViewPointSet[i];

      resultE.push([i, e]);

    }
    return resultE
  }

  onResize(vl: any) {
  }

  onEcgResize(vl: any): void {
    let w = this.plot.width();
    let h = this.plot.height();
    if (w === 0 || h === 0) { return; }
    $.plot(this.plot, this.plotDataSet, this.getOption());
  }

  toggleHeightZoom(e: any) {
    if (!this.heightzoom) {
      this.plot.height(this.height * 2);
    } else {
      this.plot.height(this.height);
    }
    $.plot(this.plot, this.plotDataSet, this.getOption());
    this.heightzoom = !this.heightzoom;
  }

  setSeekbar(percent: number) {

    if (percent < 0 || percent > 1) { }
    percent = Math.max(0, percent);
    percent = Math.min(1, percent);
    let value = percent * this.seekbarWidth;
    this.seekbarPosition = Math.round(value);
    // this.hrUpdate.emit();
    if (this.seekbarPosition === this.seekbarWidth) { this.stop(); }
    if (this.seekbar) {
      value = Math.min(1500, value);
      value = Math.max(0, value);
      this.seekbar.slider('value', value);

    }

  }

  msToTime(x: any) {
    // let ms = x % 1000;
    x = x / 1000;
    x = Math.floor(x);
    let secs = x % 60;
    let secsStr = ('00' + secs).substr(-2);
    x = x / 60;
    x = Math.floor(x);
    let mins = x % 60;
    let minsStr = ('00' + mins).substr(-2);
    x = x / 60;
    x = Math.floor(x);
    let hours = x;
    let hoursStr = ('00' + hours).substr(-2);
    return hoursStr + ':' + minsStr + ':' + secsStr;
  }

  /**
			 * set current time
			 * @param {number} v
			 * @returns {void}
			 */
  setCurrentTime(v: number) {
    // console.log(this.AccDataSize, this.selectedDataSet)
    let ms = this.AccDataSize * 4; // ecg frequence = 250, to millisecond
    this.timeTotal = this.msToTime(ms);
    let curMs = this.plotPosInWorld * 4;
    this.timeNow = this.msToTime(curMs);

  }

  // seekbar callback
  seekbarClick(value: any): void {

    // convert to percent
    let percent = value / this.seekbarWidth;
    this.setSeekbar(percent);

    percent = Math.max(0, percent);
    percent = Math.min(1, percent);
    let position: number = percent * (this.AccDataSize - this.plotSize * this.zoom);
    // round the value
    position = Math.round(position);
    this.plotPosInWorld = position;
    this.streamOffset = position;

    this.position = position;
    this.seekbarCaptured = false;
    this.setViewEmpty();

    this.bSeekbarChanged = true;
    if (!this.nowUpdate) {
      this.update();
    }
  }
  processAFStreamData(stream: any) {
    let elementLength = stream.data.AFs.length;
    if (elementLength === 0) { return; }

    let AFset = new AFSet(stream.data.AFs[0].start, stream.data.AFs[0].end);
    if (this.AFQueue.length !== 0) {
      if (AFset.start !== this.AFQueue[this.AFQueue.length - 1].start) { this.AFQueue.push(AFset); }
    } else { this.AFQueue.push(AFset); }

    for (let i = 1; i < elementLength; i++) {
      this.AFQueue.push(new AFSet(stream.data.AFs[i].start, stream.data.AFs[i].end));
    }

  }
  intersect(x1: number, y1: number, x2: number, y2: number): any {
    let x: number = Math.max(x1, x2);
    let y: number = Math.min(y1, y2);
    if (y <= x) { return null; }
    x -= x1;
    y -= x1;
    x /= this.zoom;
    y /= this.zoom;
    return { start: x, end: y };
  }

  reArrangeAFData(): void {
    if (this.AFQueue.length > 0) {
      if (this.plotPosInWorld > this.AFQueue[0].end) { this.AFQueue.slice(1); }
    }
    this.AFsInView = [];
    let endPosInWorld = this.plotPosInWorld + this.zoom * this.plotSize;
    for (let i = 0; i < this.AFQueue.length; i++) {
      let rst = this.intersect(this.plotPosInWorld, endPosInWorld, this.AFQueue[i].start, this.AFQueue[i].end);
      if (rst != null) {
        this.AFsInView.push(rst);
      }
    }
  }

  // processStreamData(stream: any) {
  //   if (stream.success) {

  //     if (stream.data.position === this.streamOffset) {

  //       // if (stream.data.AFs != null || stream.data.AFs != undefined) {
  //       //   this.processAFStreamData(stream);
  //       // }

  //       let resLength;

  //       if (stream.data == null) { console.log('stream data is wrong'); }
  //       this.streamOffset += stream.data.ecg.length;

  //       resLength = stream.data.ecg.length;

  //       if (stream.data.ecg == null) {

  //       }
  //       for (let i = 0; i < resLength; i = i + 1) {
  //         let e = stream.data.ecg[i];
  //         e = this.ecgTransform(e);
  //         this.enQueue(e);
  //       }
  //     } else {
  //       console.log("stream process else")
  //     }
  //     this.sendStreamRequest();
  //   } else {
  //     this.sendStreamRequest();
  //   }
  // }

  ecgTransform(v: number): number {
    let e = v;
    e = Math.max(0, e);
    return e;
  }

  enQueue(v: number): void {
    this.queue.push(v);
  }
  position = 0;
  deQueue(count: number): number {
    if (count === 0 || this.queue.length < count) {
      return -1;
    }

    const derivationE: number[] = [];

    // console.log("dequeue count", count, this.queue.length)
    if (this.queue.length === 1) {
      return this.queue[0];
    }
    for (let i = this.position + 0; i < this.position + count; i++) {
      if (i === this.position + 0) {
        derivationE[i] = this.queue[i + 1] - this.queue[i];
      } else if (i === this.position + count - 1) {
        if (this.queue.length > this.position + count) {
          derivationE[i] = this.queue[i + 1] - 2 * this.queue[i] + this.queue[i - 1];
        } else {
          derivationE[i] = -this.queue[i] + this.queue[i - 1];
        }
      } else {
        derivationE[i] = this.queue[i + 1] - 2 * this.queue[i] + this.queue[i - 1];
      }
      derivationE[i] = Math.abs(derivationE[i]);
    }
    let peakIndexE = this.position + 0;
    let peakValE = derivationE[this.position + 0];

    for (let i = this.position + 1; i < this.position + count; i++) {
      if (derivationE[i] > peakValE) {
        peakValE = derivationE[i];
        peakIndexE = i;
      }
    }

    const rstE = this.queue[peakIndexE];
    // if (this.position % 1000 == 0)
    //   console.log("position", this.position, rstE);
    // this.queue = this.queue.slice(count);

    return rstE;
  }

  isEmptyQueue(): boolean {
    return (this.queue.length === 0);
  }

  play(): void {
    this.isPlaying = true;
    this.update();
  }

  stop(): void {
    this.isPlaying = false;
  }

  zoomin(): void {
    const preStatus = this.zoom;
    this.zoom /= 2;
    this.zoom = Math.max(1, this.zoom);

    if (preStatus === this.zoom) { return; }

    this.zoomProcess();
  }

  zoomProcess(): void {
    this.seekbarClick(this.seekbarPosition);
    this.bZoomTransform = true;
    this.update();
  }

  zoomout(): void {
    const preStatus = this.zoom;
    this.zoom *= 2;
    this.zoom = Math.min(4, this.zoom);

    if (preStatus === this.zoom) { return; }

    this.zoomProcess();
  }

  speedUp(): void {
    this.speed *= 2;
    this.speed = Math.min(8, this.speed);
  }

  speedDown(): void {
    this.speed /= 2;
    this.speed = Math.max(1, this.speed);
  }

  onMouseClick(event: any) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }
}
