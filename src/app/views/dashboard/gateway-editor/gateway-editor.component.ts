import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { GatewayService, IOTService, Device, Gateway } from 'app/services';

declare var $: any;

@Component({
  selector: 'gateway-editor',
  templateUrl: './gateway-editor.component.html',
  styleUrls: ['./gateway-editor.component.scss']
})
export class GatewayEditorComponent implements OnInit {
  @Input() gateway: Gateway;
  @Output() close = new EventEmitter();
  @ViewChild('dangerModal') dangerModal;

  gatewayName = '';
  scannedDevices = [];
  userName: string;
  selectedMacAddress: string;

  isLoading = false;
  isSaving = false;

  scanError = false;
  existsError = false;

  deviceEditorOpened = false;

  device: Device;

  // for Device ADD/Remove (object with mac address)
  addedInfo = []
  removedInfo = []

  constructor(private gatewayService: GatewayService, private iotService: IOTService) { }

  ngOnInit() {
    this.gateway = Object.assign({}, this.gateway);
    this.gatewayName = this.gateway.name;
  }

  onTapScan() {
    this.scannedDevices = [];
    this.isLoading = true;
    this.scanError = false;
    this.iotService.sendCloudToDeviceMessage(this.gateway.deviceId, 'startScan', {}).subscribe(res => {
      this.isLoading = false;
      console.log(res);
      if (!res.success) {
        this.scanError = true;
        setTimeout(() => {
          this.scanError = false;
        }, 5000);
      } else {
        this.scannedDevices = res.result.payload.data;
        console.log(res.result.payload.data);
      }
    });
  }

  onTapAdd() {
    this.existsError = false;
    this.gateway.devices.forEach(device => {
      if (device.mac === this.selectedMacAddress) {
        this.existsError = true;
        setTimeout(() => {
          this.existsError = false;
        }, 3000);
        return;
      }
    });
    if (this.existsError) { return; }

    const newDevice = new Device();
    newDevice.deviceName = this.getDeviceNameFromMac(this.selectedMacAddress);
    console.log('newDevice', newDevice);
    newDevice.mac = this.selectedMacAddress;
    newDevice.name = this.userName;
    newDevice.gatewayID = this.gateway._id;

    this.addedInfo.push({ mac: newDevice.mac, deviceName: newDevice.deviceName });
    const index = this.removedInfo.indexOf(newDevice.mac);
    if (index !== -1) {
      this.removedInfo.slice(index, 1);
    }
    // if (this.removedInfo[newDevice.mac]) delete this.removedInfo[newDevice.mac];

    this.gateway.devices.push(newDevice);

    this.userName = '';
  }
  getDeviceNameFromMac(mac: string) {
    if (this.scannedDevices === null) { return ''; }
    if (this.scannedDevices.length === 0) { return ''; }
    for (let i = 0; i < this.scannedDevices.length; i++) {
      if (this.scannedDevices[i].mac === mac) { return this.scannedDevices[i].name; }
    }
    return '';
  }
  formatMac(mac: string) {
    if (!mac) { return ''; }
    let result = '';
    for (let i = 0; i < mac.length; i++) {
      result += mac[i];
      if (i % 2 === 1 && i !== 0 && i !== (mac.length - 1)) {
        result += ':';
      }
    }
    return result.toUpperCase();
  }


  onCancel() {
    this.addedInfo = [];
    this.removedInfo = [];
  }

  onSave() {
    this.isSaving = true;
    const self = this;
    this.gatewayService.updateGateway(this.gateway).subscribe(res => {
      this.isSaving = false;
      // this.close.emit(this.gateway);
      // make register event


      console.log('added info', this.addedInfo, 'removed info', this.removedInfo);
      console.log(this.addedInfo.length)
      if (this.addedInfo.length !== 0) {
        console.log('send add', this.addedInfo.length);
        self.iotService.sendCloudToDeviceMessage(self.gateway.deviceId, 'registerDevices', this.addedInfo).subscribe(res => {
          self.addedInfo = [];
          if (!res.success) {
            console.error(res);
          } else { }
        });
      }

      // make remove event
      if (this.removedInfo.length !== 0) {
        console.log('send remvove', this.removedInfo.length)
        self.iotService.sendCloudToDeviceMessage(self.gateway.deviceId, 'removeDevices', this.removedInfo).subscribe(res => {
          // this.isLoading = false;
          self.removedInfo = [];
          if (!res.success) {
            console.error(res);
          } else {
            // this.scannedDevices = res.result.payload.data;
          }
        });
      }
    });
  }

  openDeviceEditor(device) {
    this.device = device;
    this.deviceEditorOpened = true;
    console.log(this.device)
  }

  deviceEditorClosed(e) {
    this.deviceEditorOpened = false;
    if (e) {
      for (let i = 0; i < this.gateway.devices.length; i++) {
        if (this.gateway.devices[i].mac === e.mac) { this.gateway.devices[i] = e; }
      }
    }
  }

  showDeleteConfirm(device) {
    this.device = device;
    this.dangerModal.show();
  }
  // deleteError = {};
  onDeleteDevice() {
    this.dangerModal.hide();

    this.removedInfo.push(this.device.mac);

    const index = this.addedInfo.indexOf(this.device.mac);
    if (index !== -1) {
      this.addedInfo.slice(index, 1);
    }
    if (this.addedInfo[this.device.mac]) { delete this.addedInfo[this.device.mac]; }

    const i = this.gateway.devices.indexOf(this.device);
    this.gateway.devices.splice(i, 1);

  }
}
