import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentUserService {

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  private getApiUrl(): string {
    return this.apiConfig.getApiUrl();  // Usa el servicio para obtener la URL
  }
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token en sessionStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
  }

  private getFiwareHeaders(): HttpHeaders {
    const fiwareService = sessionStorage.getItem('fiware-service')
    const fiwareServicepath = sessionStorage.getItem('fiware-servicepath')
    if (!fiwareService) {
      throw new Error('No se encontró el fiware-service en sessionStorage');
    } else if (!fiwareServicepath) {
      throw new Error('No se encontró el fiware-servicepath en sessionStorage');
    }
    return new HttpHeaders({
      'fiware-service': fiwareService,
      'fiware-servicepath': fiwareServicepath
    });
  }
  
  // Crear un usuario premium de pago
  register(paymentUserData: any): Observable<any> {
    return this.http.post(`${this.getApiUrl()}/oauth2/premium/user`, paymentUserData).pipe(
      catchError(err => throwError(err))
    );
  }

  // Obtener información de las suscripciones de un usuario
  getUserSubscriptions(username: string): Observable<any> {
    return this.http.get(`${this.getApiUrl()}/oauth2/premium/user/info/${username}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('Error en la API:', err);
        return throwError(err);
      })
    );
  }

  getUsersSubscriptions(id: string): Observable<any> {
    return this.http.get(`${this.getApiUrl()}/oauth2/premium/users/info/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('Error en la API:', err);
        return throwError(err);
      })
    );
  }

  getUsername(): string {
    return sessionStorage.getItem('username') || '';
  }

  // Obtener todos los usuarios premium de pago
  getPaymentUsers(): Observable<any[]> {
    const url = `${this.getApiUrl()}/oauth2/premium/users`;
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un usuario premium de pago por ID
  getPaymentUserById(id: string): Observable<any> {
    const url = `${this.getApiUrl()}/oauth2/premium/user/${id}`;
    const headers = this.getAuthHeaders();
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un usuario premium de pago
  updatePaymentUser(id: string, user: any): Observable<any> {
    const url = `${this.getApiUrl()}/oauth2/premium/user/${id}`;
    const headers = this.getAuthHeaders();
    return this.http.put<any>(url, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un usuario premium de pago (soft delete)
  deletePaymentUser(id: string): Observable<any> {
    const url = `${this.getApiUrl()}/oauth2/premium/user/${id}/delete`;
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(url, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un usuario premium de pago
  restorePaymentUser(id: string): Observable<any> {
    const url = `${this.getApiUrl()}/oauth2/premium/user/${id}/restore`;
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(url, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createAuthorityKey(authorityData: any): Observable<any> {
    return this.http.post(`${this.getApiUrl()}/oauth2/authoritiesKey`, authorityData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(err))
    );
  }

  //Metodos para edificios y salas
  getBuildings(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/v1/smartcity/building`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }


  createBuilding(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.getApiUrl()}/v1/smartcity/building`, formData, { headers });
  }

  // Método para obtener la imagen por ID
  getImageById(imageId: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.getApiUrl()}/v1/smartcity/building/image/${imageId}`, {
      headers,
      responseType: 'blob'  // Esto es para que la respuesta sea la imagen (Blob)
    }).pipe(
      catchError(err => throwError(err))
    );
  }

  getBuildingById(id: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/v1/smartcity/building/${id}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  deleteBuilding(id: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any[]>(`${this.getApiUrl()}/v1/smartcity/building/${id}/cleanSlate`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  getBranchById(name: string, id: string,): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/v1/starcity/branch/${name}/${id}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  getBranchImageById(imageId: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.getApiUrl()}/v1/starcity/branch/image/${imageId}`, {
      headers,
      responseType: 'blob'  // Esto es para que la respuesta sea la imagen (Blob)
    }).pipe(
      catchError(err => throwError(err))
    );
  }

  createBranch(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.getApiUrl()}/v1/starcity/branch/`, formData, { headers });
  }

  registerSerivceDevice(paymentUserData: any): Observable<any> {
    const headers = this.getAuthHeaders()
  .append('fiware-service', sessionStorage.getItem('fiware-service') || '')
  .append('fiware-servicepath', sessionStorage.getItem('fiware-servicepath') || '');

    return this.http.post(`${this.getApiUrl()}/v1/ngsi/devices/json`, paymentUserData, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  // Manejar errores de HTTP
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(error);
  }
}
