import { Component, Input, OnChanges, OnInit, EventEmitter } from '@angular/core';

import { ChartComponent, } from 'angular2-highcharts';
import { ChartEvent } from 'angular2-highcharts/dist/ChartEvent';
@Component({
  selector: 'posture-chart',
  templateUrl: './posture-chart.component.html',
  styleUrls: ['./posture-chart.component.css']
})
export class PostureChartComponent implements OnChanges, OnInit {
  @Input() ecg: Number[];

  options: any;
  chart: ChartComponent = null;
  colors = ['#FFA47F', '#66A47F', '#0C337F', '#0CA400', '#0CA47F'];
  ngOnInit() {
    // console.log(this.options.series[0].data);
    if (this.ecg == null) { return; }
    if (this.ecg.length >= 6) {
      const data = [];
      for (let i = 0; i < 6; i++) {
        data.push({ y: this.ecg[i], color: this.colors[i] });
      }
      this.options.series[0].data = data;
    }
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

  constructor() {
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
      series: [{
        name: 'posture',
        data: [
          { y: 133, color: '#0CA47F' }],
        pointWidth: 36
      }]
    };

    this.update()
  }
  posture = [];

  update() {
    const rand = Math.random() * 10 % this.colors.length;
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
        for (let i = 0; i < this.posture.length; i++) {
          //   this.chart.series[i].setData(this.posture[i]);
        }
        this.chart.series[0].setData(item);
        // this.chart.redraw(null);
      }
    } catch (err) {
      console.error(err);
    }
    const self = this;
    // setTimeout(() => {
    //   self.update()
    // }, 1000);
  }
}
