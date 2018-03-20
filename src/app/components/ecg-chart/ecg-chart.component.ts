import {
  Component, OnInit, AfterViewInit,
  Input, ElementRef, OnDestroy, Output, EventEmitter, ViewChild
} from '@angular/core';
import * as requestInterval from 'request-interval';

declare let $: any;

@Component({
  selector: 'ecg-chart',
  templateUrl: './ecg-chart.component.html',
  styleUrls: ['./ecg-chart.component.scss'],
})

export class EcgChartComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvas: any;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  scanBarWidth = 20;
  px = 0;
  py = 0;
  cx = 0;
  cy = 0;

  PLOT_HEIGHT = 4096;
  intervalID;
  speed = 3;
  drawingInterval = 50;
  pointsPerInterval;

  oneWindow = 240;
  windowCount = 3;
  drawingWidth: number;

  DATA_LIMIT_MAX = 15000;

  data: number[] = [];

  ngOnInit() {
    this.initCanvas();

    this.drawingWidth = this.oneWindow * this.windowCount;
    this.speed = (this.width / (1000 / this.drawingInterval)) / this.windowCount;
    this.pointsPerInterval = this.oneWindow / (1000 / this.drawingInterval);

    this.intervalID = requestInterval(this.drawingInterval, () => {
      this.drawLine();
    });
  }

  initCanvas() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.context.strokeStyle = '#00ff00';
    this.context.lineWidth = 1;
    this.width = this.canvas.nativeElement.width;
    this.height = this.canvas.nativeElement.height;
    this.cy = this.py = this.height / 2;
  }

  drawLine() {
    this.context.clearRect(Math.ceil(this.px), 0, this.scanBarWidth, this.height);

    this.context.beginPath();
    for (let i = 0; i < this.pointsPerInterval; i++) {
      if (this.data.length > 0) {
        this.cy = this.height - (this.data[0] + 50) * (this.height / this.PLOT_HEIGHT);
        this.data.splice(0, 1);
      } else {
        this.cy = this.height / 2;
      }
      this.context.moveTo(this.px, this.py);
      this.context.lineTo(this.cx, this.cy);

      this.px = this.cx;
      this.py = this.cy;
      this.cx += this.speed / this.pointsPerInterval;

      if (this.cx > this.width) {
        this.px = this.cx = -this.speed;
      }
    }

    this.context.stroke();
  }

  ngOnDestroy() {
    requestInterval.clear(this.intervalID);
  }

  push(arr: number[]) {
    this.data = this.data.concat(arr);
    console.log(this.data.length);
    if (this.data.length > this.DATA_LIMIT_MAX) {
      this.data = this.data.slice(0, 5000);
    }
  }
}
