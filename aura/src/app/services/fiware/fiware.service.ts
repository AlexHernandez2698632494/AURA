import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';
import { I } from '@angular/cdk/keycodes';

@Injectable({
  providedIn: 'root'
})
export class FiwareService {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.baseUrl = `${this.apiConfig.getApiUrl()}`;  // URL de la API de Fiware
  }
  private getAuthHeaders(fiwareService: string): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token en sessionStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'fiware-service': fiwareService
    });
  }
  private getTokenHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token en sessionStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Método para obtener servicios de la ruta /v1/ngsi/services-path
  getSubServices(fiwareService: string): Observable<any> {
    const headers = new HttpHeaders({
      'fiware-service': fiwareService
    });

    return this.http.get(`${this.baseUrl}/v1/ngsi/services-path`, { headers })
      .pipe(catchError(this.handleError));
  }

  getAllSubServices(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    const fiwareService = sessionStorage.getItem('fiware-service');
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath'); // Aquí estaba un error de tipo en el nombre de la clave en sessionStorage

    if (!token || !fiwareService || !fiwareServicePath) {
      throw new Error('Faltan datos en sessionStorage');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'fiware-service': fiwareService,
      'fiware-servicepath': fiwareServicePath,
    });
  }

  getSubServiceBuilding(fiwareService: string): Observable<any> {
    const headers = this.getAuthHeaders(fiwareService);

    return this.http.get(`${this.baseUrl}/v1/ngsi/services-path/building`, { headers })
      .pipe(catchError(this.handleError));
  }

  getSubServiceBranch(fiwareService: string, fiwareServicePath: string): Observable<any> {
    const headers = new HttpHeaders({
      'fiware-service': fiwareService,
      'fiware-service-building': fiwareServicePath
    });

    return this.http.get(`${this.baseUrl}/v1/ngsi/services-path/branch`, { headers })
      .pipe(catchError(this.handleError));
  }
  // Método para obtener entidades de la ruta /v1/ngsi/entities
  getEntitiesWithAlerts(fiwareService: string, fiwareServicePath: string, type: string = '', limit: number = 100): Observable<any> {
    const headers = new HttpHeaders({
      'Fiware-Service': fiwareService,
      'Fiware-ServicePath': fiwareServicePath
    });

    const params = { type, limit };

    return this.http.get(`${this.baseUrl}/v1/ngsi/entities`, { headers, params })
      .pipe(catchError(this.handleError));
  }

  getHistoricalData(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/ngsi/historical/${id}/sensors`, {
      headers: this.getAllSubServices()
    }).pipe(
      catchError(err => {
        console.error('Error en la API:', err);
        return throwError(err);
      })
    );
  }

  getApiKeys(): Observable<any[]> {
    const headers = this.getTokenHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/v1/smartcity/view/apikeys`, { headers })
      .pipe(catchError(this.handleError));
  }

  getDeviceKeys(): Observable<any[]> {
    const headers = this.getTokenHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/v1/smartcity/view/devicekeys`, { headers })
      .pipe(catchError(this.handleError));
  }

  createApiKeys(apikeys: any): Observable<any> {
    const headers = this.getTokenHeaders();
    return this.http.post(`${this.baseUrl}/v1/smartcity/create/apikey`, apikeys, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createDeviceKeys(apikeys: any): Observable<any> {
    const headers = this.getTokenHeaders();
    return this.http.post(`${this.baseUrl}/v1/smartcity/create/devicekey`, apikeys, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getGenerateApiKeys(): Observable<any[]> {
    const headers = this.getTokenHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/v1/smartcity/generate/apikey`, { headers })
      .pipe(catchError(this.handleError));
  }

  getGenerateDeviceKeys(): Observable<any[]> {
    const headers = this.getTokenHeaders();
    return this.http.get<any[]>(`${this.baseUrl}/v1/smartcity/generate/devicekey`, { headers })
      .pipe(catchError(this.handleError));
  }

  getRulesByServiceSubserviceActuatorAndCommand(actuatorId: string, command: string): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/rules/${actuatorId}/${command}`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  getEntities(): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/entities`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  createRule(payload: any): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/rules`;

    return this.http.post<any>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateActuador(payload: any): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/update/actuator`;

    return this.http.post<any>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getRuleStats(): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/rules/stats`;

    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  updateRuleEnabled(payload: any, id: string): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/rules/${id}/enabled`;

    return this.http.patch<any>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  FailedStatusGhost(apikey: string, id: string,payload:any): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/failed/ghost?k=${apikey}&i=${id}`;

    return this.http.post<any>(url, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getDeviceById(id: string): Observable<any> {
    const headers = this.getAllSubServices();
    const url = `${this.baseUrl}/v1/ngsi/device/${id}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private idActuador: string = '';
  setIdActuador(id: string) {
    this.idActuador = id;
  }
  getIdActuador(): string {
    return this.idActuador;
  }


  // Manejo de errores
  private handleError(error: any): Observable<never> {
    console.error('Error al obtener datos', error);
    return throwError('Algo salió mal. Intenta de nuevo más tarde.');
  }
}
