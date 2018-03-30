import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GatewayService, IOTService } from 'app/services';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  approvedGateways: any[] = [];
  unApprovedGateways: any[] = [];
  selectedGateway: any;
  gatewayEditorOpened = false;
  isApprove = false;
  constructor(private gatewayService: GatewayService, private iotService: IOTService) { }

  ngOnInit(): void {
    this.getGateways();
    this.iotService.listenMessages();
  }

  getGateways() {
    this.approvedGateways = [];
    this.unApprovedGateways = [];
    this.gatewayService.getGateways().subscribe(res => {
      // this.gateways = res.gateways;
      console.log(res.gateways);
      for (let i = 0; i < res.gateways.length; i++) {
        const gateway_item = res.gateways[i];
        if (gateway_item.isApprove) {
          this.approvedGateways.push(gateway_item);
        } else {
          this.unApprovedGateways.push(gateway_item);
        }
      }

    });
  }

  deleteGateway() {
    this.gatewayService.deleteGateway(this.selectedGateway.deviceId).subscribe(res => {
      this.getGateways();
    })
  }

  openGatewayEditor(gateway) {
    this.selectedGateway = gateway;
    this.gatewayEditorOpened = true;
  }

  onEditorClose(e) {
    this.gatewayEditorOpened = false;
    if (e) {
      this.getGateways();
    } else {

    }
  }
  onTapAllowOrReject(gateway, isApprove) {
    if (!gateway) {
      return;
    }
    gateway.isApprove = isApprove;
    this.gatewayService.updateGateway(gateway).subscribe(res => {
      if (!res.success) {
        alert('Cannot update');
      }
      if (!isApprove) {
        // delete gateway
        this.gatewayService.deleteGateway(gateway.deviceId).subscribe(resObj => {
          this.getGateways();
        });
        return;
      }
      this.getGateways();
    });
  }
  rejectGateway() {
    this.onTapAllowOrReject(this.selectedGateway, false);
  }

}
