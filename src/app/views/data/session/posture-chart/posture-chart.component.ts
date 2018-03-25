import { Component, Input, OnChanges, OnInit, EventEmitter } from '@angular/core';
import { SharedService } from '../../../../services/index';
import { ChartComponent, } from 'angular2-highcharts';
import { ChartEvent } from 'angular2-highcharts/dist/ChartEvent';
import { environment } from '../../../../../environments/environment';
import { FileType } from '../../../../common/FileType';
@Component({
  selector: 'posture-chart',
  templateUrl: './posture-chart.component.html',
  styleUrls: ['./posture-chart.component.scss']
})
export class PostureChartComponent implements OnChanges, OnInit {
  // @Input() ecg: Number[];
  isError = false;
  isBusy = true;
  options: any;
  chart: ChartComponent = null;
  // case 1:
  //           this.postureImageSrc = 'assets/img/user-down.png';
  //           break;
  //         case 0:
  //           this.postureImageSrc = 'assets/img/user-up.png';
  //           break;
  //         case 2:
  //           this.postureImageSrc = 'assets/img/user-walk.png';
  // up 009e0f
  // walk e539c3
  // down 2b78e4
  colors = ['#2b78e4', '#009e0f', '#e539c3'];
  selectedDataSet: any;
  ngOnInit() {
    // if (this.ecg == null) { return; }
    // if (this.ecg.length >= 6) {
    //   const data = [];
    //   for (let i = 0; i < 6; i++) {
    //     data.push({ y: this.ecg[i], color: this.colors[i] });
    //   }
    //   this.options.series[0].data = data;
    // }
    this.selectedDataSet = this.sharedService.getSelectedDataSet();
    this.getStorageFile(true);
    // setTimeout(() => {
    //   let numArr = [1, 1, 1, 2, 1];
    //   for (let i = 0; i < 100; i++)
    //     numArr.push(1)


    //   console.error(result)

    //   // this.update(test)
    // }, 1000)

  }
  getStorageFile(isInflate: boolean) {
    // const url = `${environment.API_URL}/dataset/download/${this.selectedDataSet.file}${FileType.POSTURE}`;
    const url = `${environment.STORAGE_URL}/${this.selectedDataSet.file}${FileType.POSTURE}?${environment.STORAGE_ACCOUNT_SAS}`;
    this.downloadFileWithInflate(url);

  }
  downloadFileWithInflate(url) {
    // This can be downloaded directly:
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    const self = this;
    xhr.onload = function (event) {
      const text = xhr.response;
      if (xhr.status == 404 || xhr.status == 403) {
        console.error('Cannot find posture file')
        self.isError = true;
        self.isBusy = false;
        return;
      }
      self.anaylsysDataBinayry(text);
    };
    xhr.onprogress = function (e) {
      // self.percent = `${Math.floor(100 * e.loaded / e.total)} %`;
    };
    xhr.open('GET', url);
    xhr.send();
  }
  isNumeric(num) {
    return !isNaN(parseFloat(num)) && isFinite(num);
  }
  data = [];
  total = 1;
  anaylsysDataBinayry(str) {
    let arr1 = str.split('');
    let numberArr = [];
    for (let i = 0; i < arr1.length; i++) {
      let item = arr1[i];
      if (this.isNumeric(item)) {
        console.log(item)
        numberArr.push(parseInt(item));
        this.data.push("item-" + parseInt(item));
      }
    }
    if (numberArr.length == 0) {
      this.isBusy = false;
      this.isError = true;
      return;
    }
    var prev = numberArr[0];
    this.total = numberArr.length;
    var result = [{ v: numberArr[0], num: 1 }];
    let countEqual = 1;
    for (let i = 1; i < numberArr.length; i++) {

      if (numberArr[i] == prev) {
        countEqual++;
      } else {

        result[result.length - 1].num = countEqual
        countEqual = 1;

        result.push({ v: numberArr[i], num: 1 })
      }
      prev = numberArr[i];
    }
    result[result.length - 1].num = countEqual
    this.update(result);
    console.log('posture,', numberArr)

  }
  ngOnChanges(changes: any) {
    if (this.chart) {
      // this.chart.series[0].setData(changes.ecg.currentValue);
    }
  }
  saveInstance(chart) {
    this.chart = chart;
    // console.log(this.chart);
  }

  constructor(private sharedService: SharedService) {
    let self = this;
    this.options = {
      chart: {
        type: 'bar',
        marginRight: 0
      },
      title: {
        text: null
      },
      // subtitle: {
      //     text: 'Source: <a href='https://en.wikipedia.org/wiki/World_population'>Wikipedia.org</a>'
      // },
      xAxis: {
        categories: ['Posture'],
        title: {
          text: null
        },
        labels: {
          enabled: false
        },
        lineWidth: 0,
        minorGridLineWidth: 0,
        lineColor: 'transparent',
        minorTickLength: 0,
        tickLength: 0
      },
      yAxis: {
        visible: false,
        title: {
          text: null
        },
        min: 0,
        labels: {
          overflow: 'justify'
        }
      },
      tooltip: {
        valueSuffix: ' seconds',
        enabled: true,
        formatter: function () {
          let duration = self.durationFormat(this.point.y);
          // let classess = ['up', 'down', 'walk'];
          // // colors = ['#2b78e4', '#009e0f', '#e539c3'];
          // let currentColor = (this.point.color + "").toLocaleUpperCase();
          // let posIndex = 0;
          // for (var i = 0; i < self.colors.length; i++) {
          //   if (currentColor.includes(self.colors[i].toLocaleUpperCase())) {
          //     posIndex = i;
          //     break;
          //   }
          // }


          // let images = ["/assets/img/user-up-color.png", "/assets/img/user-down-color.png", "/assets/img/user-walk-color.png"];
          // let posinfo = self.colors
          // let pos = `<div style='display: inline-block;
          // width: 30px;
          // height: 30px;
          // background-size: 100%;
          // background-image:url("${images[posIndex]}")'>d</div>`
          return duration;
        }
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            formatter: function () {
              return '';
            }// END formatter function
          },
          borderColor: '#000'
        },
        series: {
          stacking: 'normal'
        }
      },
      legend: {
        enabled: false,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -0,
        y: 80,
        floating: true,
        borderWidth: 1,
        shadow: true
      },
      credits: {
        enabled: false
      },
      series: [
        //   {
        //   name: 'posture',
        //   data: [
        //     { y: 133, color: '#0CA47F' }],
        //   pointWidth: 36
        // }
      ]
    };
  }
  posture = [];
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
  update(data) {
    this.isBusy = false;
    var series = [];
    for (var i = 0; i < data.length; i++) {
      // const rand = data[i] % this.colors.length;
      // console.log(rand, typeof (rand))
      const item = {
        name: 'posture',
        data: [
          { y: data[i].num * this.selectedDataSet.duration / this.total, color: this.colors[data[i].v] }],
        pointWidth: 36
      };

      // this.posture.push(item);
      try {
        if (this.chart != null) {
          this.chart.addSeries(item);
          series.push(item);
          // this.chart.series[0].setData(item);
          // this.chart.redraw(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
    this.options.series = series;
  }
}
