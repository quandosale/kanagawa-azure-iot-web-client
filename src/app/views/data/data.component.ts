import { Component, OnInit, ElementRef, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { DataService, Dataset, SharedService } from '../../services/index';
import { Subject } from 'rxjs/Subject';
import { MyCalendarComponent } from 'app/components/';

import * as asyncLib from 'async';

import { Meta, Title } from '@angular/platform-browser';
declare let $: any;
@Component({
  selector: 'page_data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
})

export class DataComponent implements OnInit, AfterViewInit, OnDestroy {
  patientsName: Array<string>;
  Data: Array<any> = [];
  DataForDisplay: Array<any> = [];

  selectedDate: Date;
  selectedCalendarType = 'month'; // all
  // selectedPatient = 'all';
  selectedDataType = '-1'; // all

  datefrom: number = -1;
  dateto: number = -1;

  busy: Promise<any>;
  selectedPatientData: any = {};

  m_limit = -1;
  sortUp = false;

  sizeSubject: Subject<any>;
  preMilli = { year: -1, month: -1, day: -1 };
  message = 'No data';
  noData = false;

  isMonthFilter = false;
  isExercise = true;
  isSleep = true;
  strStorageUsed = '0 KB';
  isLoadStorage = true;

  isGatewayFilter = false;
  isUserFilter = false;
  constructor(private dataService: DataService,
    private sharedService: SharedService,

    private router: Router,

    public elNode: ElementRef,
    public meta: Meta,
    public title: Title) {
    this.sizeSubject = new Subject();
    // this.initData();
    // this.makeFirebaseRequest();
    title.setTitle('CALM. Online - Data Page');
    meta.addTags([
      { name: 'author', content: 'sports.calm-health.com' },
      { name: 'keywords', content: 'Angular 2, angular 4, data, ecg, sleep, calmnes, heart rate, exercise session' },
      { name: 'description', content: 'Data Page' }
    ]);
  }
  // static storageFormat(n: number): string {
  //   if (n === 0) {
  //     return '0 bytes';
  //   } else if (n < 1024) {
  //     return '' + n + ' bytes';
  //   }
  //   if (1024 <= n && n < 1024 * 1024) {
  //     n = n / 1024;
  //     let r = '' + n.toFixed(0) + ' KB';
  //     return r;
  //   }
  //   if (1024 * 1024 <= n && n < 1024 * 1024 * 1024) {
  //     n = n / 1024 / 1024;
  //     let r = '' + n.toFixed(0) + ' MB';
  //     return r;
  //   }
  //   if (1024 * 1024 * 1024 <= n && n < 1024 * 1024 * 1024 * 1024) {
  //     n = n / 1024 / 1024 / 1024;
  //     let r = '' + n.toFixed(0) + ' GB';
  //     return r;
  //   }

  //   return '0 bytes';
  // }
  ngOnInit(): void {
    this.selectedDate = new Date();
    // let _datatype = this.sharedService.getDataType();
    // if (_datatype !== null) {
    //   if (_datatype.length !== 0) {
    //     this.selectedDataType = _datatype.toString();
    //   }
    // }

    // let _caltype = this.sharedService.getCalendarType();
    // if (_caltype !== null) {
    //   if (_caltype.length !== 0) {
    //     this.selectedCalendarType = _caltype.toString();
    //   }
    // }
    const prevDataFilter = this.sharedService.getDataFilter();
    this.isMonthFilter = prevDataFilter.isMonthFilter;
    this.isExercise = prevDataFilter.isExercise;
    this.isSleep = prevDataFilter.isSleep;

    this.DataForDisplay = this.sharedService.getDataList();
    // if (this.DataForDisplay.length === 0) {
    this.getDatas();
    // this.initData();
    // }
  }
  ngAfterViewInit() {
    const tab2 = $(this.elNode.nativeElement).find('#tab2info');
    tab2.removeClass('in active');
    const tab1 = $(this.elNode.nativeElement).find('#tab1info');
    tab1.addClass('in active');

  }
  ngOnDestroy() {
    this.sharedService.setDataList(this.DataForDisplay);
    this.sharedService.setDataFilter(this.isMonthFilter, this.isExercise, this.isSleep);
    console.log('destory');
  }
  onTapSort() {
    this.sortUp = !this.sortUp;
    this._sort();
  }
  _sort() {
    this.DataForDisplay.sort((a: any, b: any) => {
      if (this.sortUp) {
        return a.start - b.start;
      } else {
        return b.start - a.start;
      }
    });
    this.DataForDisplay.forEach((dataset, index) => {
      dataset.isFirst = this.isFirst(new Date(dataset.start));
    });
  }

  transform(data: any): any {
    const dataset = data;
    dataset.datetime = this.datetimeToDate(new Date(dataset.start));
    dataset.time = this.datetimeToTime(new Date(dataset.start));
    dataset.isFirst = this.isFirst(new Date(dataset.start));
    dataset.durationStr = this.durationFormat(dataset.duration);

    const type: Number = dataset.datatype;
    return dataset;
  }


  findIndex(dataset): number {
    for (let i = 0; i < this.Data.length; i++) {
      if (this.Data[i].datasetId === dataset.datasetId) {
        return i;
      }
    }
    return -1;
  }


  tapMore() {
    this.m_limit += 10;
    this.getDatas();
    // this.sizeSubject.next(this.m_limit);
    // console.log(this.m_limit)
    // this.makeFirebaseRequest();
  }




  getDatas(): void {
    // const userID = this.sharedService.getUser().uid;
    const userID = 'r69lT5eiLfdpsgY4d8NWGQ9usv83';
    // if (this.selectedPatient === 'all') {
    // } else {
    // }

    // console.log(userID, this.datefrom, this.dateto, this.selectedDataType, 'limmit: ', this.m_limit);
    this.preMilli = { year: -1, month: -1, day: -1 };
    this.Data = [];
    this.dataService.getRecordList([userID], -1, -1, '-1', this.m_limit)
      .subscribe(res => {
        console.log(res);
        if (res.success) {
          this.Data = [];

          if (res.data.length === 0) {
            this.noData = true;
            return;
          }

          for (const element of res.data) {
            // console.log(element);
            this.Data.push(this.transform(element));
          } // for
          this.filterData();
        } else {
          this.noData = true;
          console.error(res.message);
        }
      });
  }

  isFirst(date: Date): boolean {
    const dateTime = new Date(date);
    const yyyy = dateTime.getFullYear();
    const month = dateTime.getMonth();
    const day = dateTime.getDate();

    const current = { year: yyyy, month: month, day: day };

    if (this.preMilli.year !== yyyy || this.preMilli.month !== month || this.preMilli.day !== day) {
      this.preMilli = current;
      return true;
    } else {
      return false;
    }
  }
  datetimeToDate(date: Date): String {
    const DAY = ['SUN', 'MON ', 'TUE ', 'WED ', 'THU ', 'FRI ', 'SAT '];
    const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dateTime = new Date(date);
    const dayStr = DAY[dateTime.getDay()];
    const yyyy = dateTime.getFullYear();
    const month = dateTime.getMonth();
    const mm = MONTH[month];
    const day = dateTime.getDate();
    const dd = (day / 10 >= 1) ? day : ('0' + day);

    const result: String = `${dayStr} ${mm} ${dd}, ${yyyy}`;
    return result;

  }
  // convert date to Formatted String
  datetimeToTime(date: Date): String {

    const dateTime = new Date(date);

    const hour = dateTime.getHours();
    // const ampm = hour < 12 ? 'AM' : 'PM';
    // hour = hour % 12;
    const hh = (hour / 10 >= 1) ? hour : ('0' + hour);

    const minute = dateTime.getMinutes();
    const min = (minute / 10 >= 1) ? minute : ('0' + minute);
    const second = dateTime.getSeconds();
    const ss = (second / 10 >= 1) ? second : ('0' + second);


    const result: String = `${hh}:${min}`;

    return result;
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

  setDateRange() {
    if (this.selectedCalendarType === 'day') {
      this.datefrom = this.selectedDate.setHours(0, 0, 0, 0);
      this.dateto = this.selectedDate.setHours(23, 59, 59, 999);
      this.datefrom = new Date(this.datefrom).getTime();
      this.dateto = new Date(this.dateto).getTime();

    }
    if (this.selectedCalendarType === 'month') {
      const date = this.selectedDate;

      this.datefrom = new Date(date.getFullYear(), date.getMonth(), 1).setHours(0, 0, 0, 0);
      this.dateto = new Date(date.getFullYear(), date.getMonth() + 1, 0).setHours(23, 59, 59, 999);

    }
    if (this.selectedCalendarType === 'week') {
      const dTmp = this.selectedDate; // get current date
      const first = dTmp.getDate() - dTmp.getDay(); // First day is the day of the month - the day of the week
      const last = first + 6; // last day is the first day + 6

      const firstDate: Date = new Date(dTmp);
      const lastDate: Date = new Date(dTmp);

      firstDate.setHours(0, 0, 0, 0);
      lastDate.setHours(23, 59, 59, 999);

      firstDate.setDate(first);
      lastDate.setDate(last);

      console.log(firstDate);
      console.log(lastDate);

      this.datefrom = new Date(firstDate).getTime();
      this.dateto = new Date(lastDate).getTime();


    }
    if (this.selectedCalendarType === 'all') {
      this.datefrom = -1;
      this.dateto = -1;
      this.getDatas();
    } else {
      // this.filterData();
    }
    this.sharedService.setDateRange(this.datefrom, this.dateto);
  }

  dayClicked(date: Date): void {
    this.selectedDate = date;
    if (this.selectedCalendarType === 'month' && this.isMonthFilter) {
      this.setDateRange();
      this.filterData();
    }
  }

  onPatientSelected(value: string): void {
    // this.selectedPatient = value;
    // this.sharedService.setSelectedPatient(value);
    // this.getDatas();
  }

  onDataTypeSelected(value: string): void {
    this.selectedDataType = value;
    this.sharedService.setDataType(value);
    console.log('datatype', value);
    if (this.selectedDataType === '-1') {
      this.getDatas();
    } else {
      this.filterData();
    }
  }
  tapFilter() {

    if (this.isMonthFilter) {
      this.setDateRange();
    } else {
      this.datefrom = -1;
      this.dateto = -1;
    }

    if (this.isExercise) {
      this.selectedDataType = '0';
    }
    if (this.isSleep) {
      this.selectedDataType = '1';
    }

    if (this.isExercise && this.isSleep) {
      this.selectedDataType = '-1';
    }
    if (!this.isExercise && !this.isSleep) {
      this.selectedDataType = '-2'; // display none;
      // console.log('monthfilter', this.isMonthFilter, 'exercise', this.isExercise, 'sleep', this.isSleep)
      // console.log(this.selectedDataType)
      this.DataForDisplay = [];
      return;
    }
    console.log('monthfilter', this.isMonthFilter, 'exercise', this.isExercise, 'sleep', this.isSleep);
    console.log(this.selectedDataType);
    this.filterData();
  }
  filterData() {
    const datatype = parseInt(this.selectedDataType, 10);
    if (this.Data === undefined || this.Data === null) { return; }
    if (this.Data.length === 0) { return; }

    // console.log('filterData', this.Data.length);
    this.DataForDisplay = [];
    const count = this.Data.length;
    console.log('data count', count);
    for (let i = 0; i < count; i++) {
      const dataItem = this.Data[i];
      // console.log(dataItem, datatype, this.datefrom, this.dateto);
      if (datatype !== -1) {
        if (dataItem.datatype !== datatype) {
          continue;
        }
      }
      if (this.datefrom === -1 && this.dateto === -1) {
        this.DataForDisplay.push(dataItem);
      } else if (dataItem.start >= this.datefrom && dataItem.start < this.dateto) {
        this.DataForDisplay.push(dataItem);
      }

    }
    this._sort();
  }

  showDetail(item) {
    console.log('click', item.datatype, item.datasetId);
    this.sharedService.setSelectedDataSet(item);
    this.router.navigate(['/session', item.datasetId, encodeURIComponent(JSON.stringify(item))]);
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
  onCalendarTypeSelected() {

  }
}
