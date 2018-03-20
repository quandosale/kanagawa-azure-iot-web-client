import { Injectable } from '@angular/core';
import { ApiService } from 'app/services/api.service';
import { Observable } from 'rxjs/Observable';
import { Dataset } from './data';
@Injectable()
export class DataService {
  constructor(private apiService: ApiService) { }

  startRecord(dataset: Dataset): Observable<any> {
    return this.apiService.put('/dataset/recordstart/', dataset);
  }
  stopRecord(dataset: Dataset): Observable<any> {
    return this.apiService.put('/dataset/recordstop/', dataset);
  }
  cancelRecord(deviceId: string): Observable<any> {
    return this.apiService.put('/dataset/recordcancel/', { deviceId: deviceId });
  }
  getRecordList(a, b, c, d, e): Observable<any> {
    return this.apiService.post('/dataset/get-list/');
  }

}
