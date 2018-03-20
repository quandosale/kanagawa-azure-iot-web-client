import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Device } from 'app/services';

@Component({
  selector: 'device-editor',
  templateUrl: './device-editor.component.html',
  styleUrls: ['./device-editor.component.scss']
})
export class DeviceEditorComponent implements OnInit {
  @Input() device: Device;
  @Output() close = new EventEmitter();

  deviceName: string;

  constructor() { }

  ngOnInit() {
    this.device = Object.assign({}, this.device);
    this.deviceName = this.device.name;
  }

  onClose() {
    this.close.emit();
  }

  formatMac(mac: string) {
    if(!mac) return '';
    let result = '';
    for(let i = 0 ; i < mac.length ; i ++) {
      result += mac[i];
      if(i % 2 == 1 && i != 0 && i != (mac.length - 1)) {
        result += ':';
      }
    }
    return result.toUpperCase();
  }
}
