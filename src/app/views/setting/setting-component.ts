import { Component, OnInit } from '@angular/core';
import { SharedService, AlarmSetting } from 'app/services';

@Component({
    selector: 'setting-page',
    templateUrl: './setting-component.html',
    styleUrls: ['./setting-component.scss']
})
export class SettingComponent implements OnInit {

    setting: AlarmSetting = new AlarmSetting();
    constructor(private sharedService: SharedService) { }

    ngOnInit() {
        this.setting = this.sharedService.getAlarmSetting();
    }
    onSwitchSensorOff() {
        this.sharedService.setAlarmSetting(this.setting);
    }

    onSwitchSensorSound() {
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchSensorFlash() {
        this.sharedService.setAlarmSetting(this.setting);
    }

    // disconnect
    onSwitchDisconnect() {
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchDisconnectSound() {
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchDisconnectFlash() {
        this.sharedService.setAlarmSetting(this.setting);
    }

     // Posture
     onSwitchPosture() {
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchPostureSound() {
        this.sharedService.setAlarmSetting(this.setting);
    }
    onSwitchPostureFlash() {
        this.sharedService.setAlarmSetting(this.setting);
    }
}
