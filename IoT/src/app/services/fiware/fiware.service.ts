import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class FiwareService {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.baseUrl = `${this.apiConfig.getApiUrl()}/v1/ngsi`;  // URL de la API de Fiware
  }

  // Método para obtener servicios de la ruta /v1/ngsi/services-path
  getSubServices(fiwareService: string): Observable<any> {
    const headers = new HttpHeaders({
      'fiware-service': fiwareService
    });

    return this.http.get(`${this.baseUrl}/services-path`, { headers })
      .pipe(catchError(this.handleError));
  }

  // Método para obtener entidades de la ruta /v1/ngsi/entities
  getEntitiesWithAlerts(fiwareService: string, fiwareServicePath: string, type: string = '', limit: number = 100): Observable<any> {
    const headers = new HttpHeaders({
      'Fiware-Service': fiwareService,
      'Fiware-ServicePath': fiwareServicePath
    });

    const params = { type, limit };

    return this.http.get(`${this.baseUrl}/entities`, { headers, params })
      .pipe(catchError(this.handleError));
  }

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error al obtener datos', error);
    return throwError('Algo salió mal. Intenta de nuevo más tarde.');
  }
}
