import { Injectable } from '@angular/core';
import { Headers, Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { toPromise } from 'rxjs/operator/toPromise';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiService {
  constructor(
    private http: Http,
  ) { }

  private setHeaders(): Headers {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // if (this.jwtService.getToken()) {
    //   headersConfig['Authorization'] = `Token ${this.jwtService.getToken()}`;
    // }
    return new Headers(headersConfig);
  }

  private formatErrors(error: any) {
    return Observable.throw(error.json());
  }

  get(path: string, params: URLSearchParams = new URLSearchParams()): Observable<any> {
    return this.http.get(`${environment.API_URL}${path}`, {  search: params })
      .catch(this.formatErrors)
      .map((res: Response) => res.json())
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${environment.API_URL}${path}`,
      JSON.stringify(body),
      { headers: this.setHeaders() }
    )
      .catch(this.formatErrors)
      .map((res: Response) => res.json())
  }

  post(path: string, body: Object = {}): Observable<any> {
    return this.http.post(
      `${environment.API_URL}${path}`,
      JSON.stringify(body),
      { headers: this.setHeaders() }
    )
      .catch(this.formatErrors)
      .map((res: Response) => res.json())
  }

  delete(path, body: Object = {}): Observable<any> {
    return this.http.delete(
      `${environment.API_URL}${path}`,
      { headers: this.setHeaders(), body: body }
    )
      .catch(this.formatErrors)
      .map((res: Response) => res.json())
  }
}
