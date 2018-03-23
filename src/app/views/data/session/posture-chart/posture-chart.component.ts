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
  anaylsysDataBinayry(str) {
    let arr1 = str.split('');
    let numberArr = [];
    for (let i = 0; i < arr1.length; i++) {
      let item = arr1[i];
      if (this.isNumeric(item)) {
        console.log(item)
        numberArr.push(parseInt(item));
      }
    }

    this.update(numberArr);
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
        enabled: false,
        // formatter: function () {
        //   let res = self.region[this.point.x].min + '<br>' + self.region[this.point.x].max;
        //   return res;
        // }
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

  update(data) {
    this.isBusy = false;
    for (var i = 0; i < data.length; i++) {
      const rand = data[i] % this.colors.length;
      const item = {
        name: 'posture',
        data: [
          { y: 133, color: this.colors[rand] }],
        pointWidth: 36
      };

      this.posture.push(item);
      try {
        if (this.chart != null) {
          let dd = new EventEmitter<ChartEvent>();
          this.chart.addSeries(item);
          this.options.series = this.posture;
          // for (let i = 0; i < this.posture.length; i++) {
          //   //   this.chart.series[i].setData(this.posture[i]);
          // }
          this.chart.series[0].setData(item);
          // this.chart.redraw(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}
