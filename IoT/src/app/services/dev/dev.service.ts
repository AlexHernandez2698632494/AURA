import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class DevService {
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

  registerAdminDev(adminData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.getApiUrl()}/dev/user`, adminData, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  getDevUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/dev/users`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  updateDevUser(userId: string, userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const usuarioHistory = sessionStorage.getItem('username'); // Obtener el username del sessionStorage
    
    const body = {
      ...userData,
      usuarioHistory: usuarioHistory,  // Agregar el usuario que realiza la acción
    };
  
    return this.http.put(`${this.getApiUrl()}/dev/user/${userId}`, body, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  

  getDevDeleteUsers(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/dev/users/delete`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  deleteDevUser(userId: string, usuarioHistory: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { usuarioHistory }; // Agregar el usuario que realiza la acción
    return this.http.patch(`${this.getApiUrl()}/dev/user/${userId}`, body, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  restoreDevUser(userId: string, usuarioHistory: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { usuarioHistory };  // Agregar el usuarioHistory al cuerpo de la solicitud
    return this.http.patch(`${this.getApiUrl()}/dev/user/restore/${userId}`, body, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  
  getAuthorities(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/authorities`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
  }
