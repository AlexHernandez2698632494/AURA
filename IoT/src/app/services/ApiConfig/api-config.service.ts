import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private apiUrlLocal = 'http://localhost:3000';
  private apiUrlNetwork = 'http://192.168.1.82:3000';
  private apiUrlnetWork2 = 'http://10.0.12.85:3000';
  private apiUrlnetWork3 = 'http://172.16.99.86:3000';

  /**
   * Determina la URL base dependiendo del entorno.
   */
  getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '192.168.1.82' || window.location.hostname === '172.16.100.200') {
      return this.apiUrlNetwork;}
      if(window.location.hostname === '172.16.99.0'){
        return this.apiUrlnetWork3}
       if (window.location.hostname === '10.0.12.85') {
      return this.apiUrlnetWork2;
    } else {
      return this.apiUrlLocal;
    }
  }
}
