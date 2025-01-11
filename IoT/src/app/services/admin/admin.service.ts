import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
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

  registerAdmin(adminData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.getApiUrl()}/user`, adminData, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  getUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/users`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.getApiUrl()}/user/${userId}`, userData, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  getDeleteUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/users/delete`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  deleteUser(userId: string, usuarioHistory: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { usuarioHistory }; // Agregar el usuario que realiza la acción
    return this.http.patch(`${this.getApiUrl()}/user/${userId}`, body, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  restoreUser(userId: string, usuarioHistory: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { usuarioHistory };  // Agregar el usuarioHistory al cuerpo de la solicitud
    return this.http.patch(`${this.getApiUrl()}/user/restore/${userId}`, body, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  
  getAuthorities(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/authorities`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  changePassword(data: { contrasenaActual: string; nuevaContrasena: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.getApiUrl()}/change-password`, data, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  restorePassword(username: string): Observable<any> {
    const url = `${this.getApiUrl()}/restore-password`;
    return this.http.post(url, { usuario: username }).pipe(
      catchError(err => throwError(err))
    );
  }
  
}
