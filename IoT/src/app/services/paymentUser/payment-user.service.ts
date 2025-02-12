import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentUserService {

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {}

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

  // Crear un usuario premium de pago
  register(paymentUserData: any): Observable<any> {
    return this.http.post(`${this.getApiUrl()}/premium/user`, paymentUserData).pipe(
      catchError(err => throwError(err))
    );
  }
     

  // Obtener todos los usuarios premium de pago
  getPaymentUsers(): Observable<any[]> {
    const url = `${this.getApiUrl()}/premium/users`;
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener un usuario premium de pago por ID
  getPaymentUserById(id: string): Observable<any> {
    const url = `${this.getApiUrl()}/premium/user/${id}`;
    const headers = this.getAuthHeaders();
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un usuario premium de pago
  updatePaymentUser(id: string, user: any): Observable<any> {
    const url = `${this.getApiUrl()}/premium/user/${id}`;
    const headers = this.getAuthHeaders();
    return this.http.put<any>(url, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un usuario premium de pago (soft delete)
  deletePaymentUser(id: string): Observable<any> {
    const url = `${this.getApiUrl()}/premium/user/${id}/delete`;
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(url, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Restaurar un usuario premium de pago
  restorePaymentUser(id: string): Observable<any> {
    const url = `${this.getApiUrl()}/premium/user/${id}/restore`;
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(url, null, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Manejar errores de HTTP
  private handleError(error: any): Observable<never> {
    console.error('Ocurrió un error:', error);
    return throwError(error);
  }
}
