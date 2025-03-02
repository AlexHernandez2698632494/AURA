import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  // Obtener los subservicios (ubicaciones) dinámicamente desde la base de datos
  getSubServices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/services-path`).pipe(
      catchError(this.handleError)
    );
  }

  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error al obtener subservicios', error);
    return throwError('Algo salió mal. Intenta de nuevo más tarde.');
  }
}
