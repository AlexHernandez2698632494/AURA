import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.baseUrl = `${this.apiConfig.getApiUrl()}/v1/ngsi`;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token en sessionStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getAlerts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/alert`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  getMappings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/alerts/mappings`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  createAlert(alertData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/alert`, alertData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  updateAlert(id: string, alertData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/alert/${id}`, alertData, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAlert(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/alert/${id}`, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  cleanSlateAlert(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/permanentAlert/${id}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  restoreAlert(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/restoreAlert/${id}`, {}, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError(() => new Error(error.message || 'Error en la solicitud')); 
  }
}
