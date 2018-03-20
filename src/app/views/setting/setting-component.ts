import { Component, OnInit } from '@angular/core';
import { SharedService, AlarmSetting } from 'app/services';

@Component({
    selector: 'setting-page',
    templateUrl: './setting-component.html',
    styleUrls: ['./setting-component.scss']
})
export class SettingComponent implements OnInit {
    isAlarmSensorOff = false;
    isSensorSound = false;
    isSensorFlash = false;

    isAlarmDisconnect = false;
    isDisconnectSound = false;
    isDisconnectFlash = false;

    setting: AlarmSetting = new AlarmSetting();
    constructor(private sharedService: SharedService) { }

    ngOnInit() {
        this.setting = this.sharedService.getAlarmSetting();
    }
    onSwitchSensorOff() {
        this.setting.isAlarmSensorOff = this.isAlarmSensorOff;
        this.sharedService.setAlarmSetting(this.setting);
    }

    onSwitchSensorSound() {
        this.setting.isSensorSound = this.isSensorSound;
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchSensorFlash() {
        this.setting.isSensorFlash = this.isSensorFlash;
        this.sharedService.setAlarmSetting(this.setting);
    }

    // disconnect
    onSwitchDisconnect() {
        this.setting.isAlarmDisconnect = this.isAlarmDisconnect;
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchDisconnectSound() {
        this.setting.isDisconnectSound = this.isDisconnectSound;
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchDisconnectFlash() {
        this.setting.isDisconnectFlash = this.isDisconnectFlash;
        this.sharedService.setAlarmSetting(this.setting);
    }
}
