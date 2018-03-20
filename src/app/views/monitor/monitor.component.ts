import { Component, OnInit } from '@angular/core';
import { GatewayService, Gateway, IOTService } from 'app/services';

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {
  gateways: Gateway[];

  constructor(
    private gatewayService: GatewayService,
    private iotService: IOTService,
  ) { }

  ngOnInit() {
    this.getGateways();
    this.iotService.listenMessages();
  }

  getGateways() {
    this.gatewayService.getGateways().subscribe(res => {
      this.gateways = res.gateways;
    })
  }
}
