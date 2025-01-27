import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private apiUrlLocal = 'http://localhost:3000';
  private apiUrlNetwork = 'http://192.168.1.82:3000';
  private apiUrlnetWork2 = 'http://192.168.1.14:3000';
  private apiUrlnetWork3 = 'http://172.16.100.200:3000';

  /**
   * Determina la URL base dependiendo del entorno.
   */
  getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '172.16.100.200') {
      return this.apiUrlLocal;
    } if (window.location.hostname === '192.168.1.14') {
      return this.apiUrlnetWork2;
    } else {
      return this.apiUrlNetwork;
    }
  }
}
