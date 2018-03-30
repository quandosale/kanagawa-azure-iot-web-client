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
  @ViewChild('firmwareUpdateModal') firmwareUpdateModal;


  gatewayName = '';
  scannedDevices = [];
  userName: string;
  selectedMacAddress: string;

  isLoading = false;

  isSaving = false;

  scanError = false;
  existsError = false;

  // gateway firmware
  isLoadingFirmwareUpdate = false;
  isErrorFirmwareUpdate = false;
  currentFirmware = '1.0.0';
  newFirmware = '1.0.0';
  // for firmware downloading progres
  downloadProcess = '';
  firmwareSize = '';

  deviceEditorOpened = false;

  device: Device;

  // for Device ADD/Remove (object with mac address)
  addedInfo = []
  removedInfo = []



  // for gateway connected status
  isConnected = false;
  isRefreshLoading = false;

  constructor(private gatewayService: GatewayService, private iotService: IOTService) { }

  ngOnInit() {
    this.gateway = Object.assign({}, this.gateway);
    this.gatewayName = this.gateway.name;
    this._initFimrwareDownloadListner();
    this._getLastGatewayFirmwareVersion();
    this._checkConnectStatus();
    this._initGatewayStartedListner();
  }

  percentFormat(percent): string {
    var pec: number = percent ? percent : 0;
    var pecNum = pec.toFixed(0) + '%';
    return pecNum;
  }

  storageFormat(n: number): string {
    if (n === 0) {
      return '0 bytes';
    } else if (n < 1024) {
      return '' + n + ' bytes';
    }
    if (1024 <= n && n < 1024 * 1024) {
      n = n / 1024;
      let r = '' + n.toFixed(0) + ' KB';
      return r;
    }
    if (1024 * 1024 <= n && n < 1024 * 1024 * 1024) {
      n = n / 1024 / 1024;
      let r = '' + n.toFixed(0) + ' MB';
      return r;
    }
    if (1024 * 1024 * 1024 <= n && n < 1024 * 1024 * 1024 * 1024) {
      n = n / 1024 / 1024 / 1024;
      let r = '' + n.toFixed(0) + ' GB';
      return r;
    }

    return '0 bytes';
  }
  _checkConnectStatus() {
    this.isRefreshLoading = true;
    this.iotService.sendCloudToDeviceMessage(this.gateway.deviceId, 'checkGatewayConnected', {}).subscribe(res => {
      this.isRefreshLoading = false;
      console.log(res);
      if (!res.success) {
        this.isConnected = false;
      } else {
        this.isConnected = true;
      }
    });
  }
  onTapRefresh() {
    this._checkConnectStatus();
    // this._getLastGatewayFirmwareVersion();
  }
  _initGatewayStartedListner() {
    var self = this;
    this.iotService.gatewayStartListner()
      .subscribe(data => {
        if (data.emitter === this.gateway.deviceId) {
          console.error(data);
          self.gateway.firmware = data.firmware;
        }
      });
  }
  _initFimrwareDownloadListner() {
    var self = this;
    this.iotService.firmwareDownloadListner()
      .subscribe(data => {
        if (data.emitter === this.gateway.deviceId) {
          console.log(data);
          if (data.completed) {
            self.isLoadingFirmwareUpdate = false;
            self.downloadProcess = '';
            self._checkConnectStatus();
            return;
          }
          self.downloadProcess = self.percentFormat(data.percent);
          self.isLoadingFirmwareUpdate = true;
          self.firmwareSize = self.storageFormat(data.totalLen);
        }
      });
  }
  _getLastGatewayFirmwareVersion() {
    this.gatewayService.getNewGatewayFirmwareVersion()
      .subscribe(data => {
        console.log(data);
        this.newFirmware = data.RPI_GATEWAY_VERSION;
      });
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
  onTapReboot() {
    this.iotService.sendCloudToDeviceMessage(this.gateway.deviceId, 'reboot', {}).subscribe(res => {
      // this.isLoading = false;
      console.log(res);
      if (!res.success) {
        // this.scanError = true;
        setTimeout(() => {
          // this.scanError = false;
        }, 5000);
      } else {
        console.log(res.result.payload.data);
      }
    });
  }
  message = '';
  onfirmwareUpdateModalConfirm() {
    this.firmwareUpdateModal.hide();
    this.sendFirmwareUpdateCommand(false);
  }
  onTapFirmaareUpdateForce() {
    this.sendFirmwareUpdateCommand(true);
  }
  sendFirmwareUpdateCommand(isMust) {
    this.isLoadingFirmwareUpdate = true;
    this.iotService.sendCloudToDeviceMessage(this.gateway.deviceId, 'onFirmwareUpdate', isMust).subscribe(res => {

      console.log(res);
      this.isLoadingFirmwareUpdate = false;
      if (!res.success) {

        this.isErrorFirmwareUpdate = true;
        setTimeout(() => {
          this.isErrorFirmwareUpdate = false;
        }, 5000);
      } else {
        console.log(res.result.payload.data);
        if (res.result.payload.data.success) {
          console.log('Success, begin downloading ...');
        } else {
          console.error(res.result.payload.data.error);
          this.message = res.result.payload.data.error;
          setTimeout(() => {
            this.message = '';
          }, 5000);
        }

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
