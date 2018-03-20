import { Injectable } from '@angular/core';
import { AlarmSetting } from './alarm-setting';
import { Dataset } from './data';
@Injectable()
export class SharedService {

    constructor() {
    }

    getLang(): string {
        let lange = JSON.parse(localStorage.getItem('_language'));
        return lange;
    }

    setLang(lange: string) {
        localStorage.setItem('_language', JSON.stringify(lange));
    }

    getUserID(): String {
        let userID = JSON.parse(localStorage.getItem('userID'));
        return userID;
    }

    setUserID(userID: String) {
        localStorage.setItem('userID', JSON.stringify(userID));
    }

    getFlag(): Boolean {
        let Flag = JSON.parse(localStorage.getItem('Flag'));
        return Flag;
    }

    setFlag(Flag: Boolean) {
        localStorage.setItem('Flag', JSON.stringify(Flag));
    }



    getCalendarType(): string {
        let type = JSON.parse(localStorage.getItem('calendartype'));
        return type;
    }
    setCalendarType(_type: string) {
        localStorage.setItem('calendartype', JSON.stringify(_type));
    }

    getSelectedDataSet(): any {
        let dataset = JSON.parse(localStorage.getItem('selectedDataSet'));
        return dataset;
    }

    setSelectedDataSet(dataset: any) {
        localStorage.setItem('selectedDataSet', JSON.stringify(dataset));
    }
    arrDatalist = [];
    getDataList(): any {
        return this.arrDatalist;
    }
    setDataList(arrDataset: any) {
        this.arrDatalist = arrDataset
    }

    isMonthFilter = false;
    isExercise = true;
    isSleep = true;
    setDataFilter(isMonthFilter, isExercise, isSleep) {
        this.isMonthFilter = isMonthFilter;
        this.isExercise = isExercise;
        this.isSleep = isSleep;
    }
    getDataFilter(): any {
        return {
            isMonthFilter: this.isMonthFilter,
            isExercise: this.isExercise,
            isSleep: this.isSleep
        };
    }

    selectedUser = {};

    setSelectedUser(user) {
        this.selectedUser = user;
    }
    getSelectedUser(): any {
        return this.selectedUser;
    }

    getDataType(): string {
        let type = JSON.parse(localStorage.getItem('datatype'));
        return type;
    }

    setDataType(_type: string) {
        localStorage.setItem('datatype', JSON.stringify(_type));
    }
    getDateRange(): any {
        let _datefrom = JSON.parse(localStorage.getItem('datefrom'));
        let _dateto = JSON.parse(localStorage.getItem('dateto'));
        let result: any = {
            datefrom: _datefrom,
            dateto: _dateto
        };
        return result;
    }
    setDateRange(_datefrom: number, _dateto: number) {
        localStorage.setItem('datefrom', JSON.stringify(_datefrom));
        localStorage.setItem('dateto', JSON.stringify(_dateto));
    }

    getSelectedPatient(): string {
        let p = JSON.parse(localStorage.getItem('selectedPatient'));
        return p;
    }

    setSelectedPatient(p: string) {
        localStorage.setItem('selectedPatient', JSON.stringify(p));
    }
    getClickDate(): Date {
        let date = JSON.parse(localStorage.getItem('clickDate'));
        return date;
    }

    setClickDate(date: Date) {
        localStorage.setItem('clickDate', JSON.stringify(date));
    }
    getSelectedMenu(): string {
        let menu = JSON.parse(localStorage.getItem('selectedMenu'));
        return menu;
    }

    setSelectedMenu(menu: string) {
        localStorage.setItem('selectedMenu', JSON.stringify(menu));
    }
    getRecordingStatus(deviceId: string): Dataset {
        let dataset: Dataset = JSON.parse(localStorage.getItem(`${deviceId}_record`));
        return dataset;
    }

    setRecordingStatus(deviceId, dataset: Dataset) {
        localStorage.setItem(`${deviceId}_record`, JSON.stringify(dataset));
    }
    getAlarmSetting(): AlarmSetting {
        const defaultAlarmSetting: AlarmSetting = new AlarmSetting();
        try {
            let alarmSetting: AlarmSetting = JSON.parse(localStorage.getItem('alarmSetting'));
            if (alarmSetting != null)
                return alarmSetting;
        } catch{
        }
        return defaultAlarmSetting;
    }

    setAlarmSetting(alarmSetting: AlarmSetting) {
        localStorage.setItem('alarmSetting', JSON.stringify(alarmSetting));
    }
}
