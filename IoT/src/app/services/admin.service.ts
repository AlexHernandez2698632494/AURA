import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl2 = 'http://localhost:3000';  // URL para desarrollo en localhost
  private apiUrl = 'http://192.168.1.82:3000'; // URL para acceder desde otro dispositivo

  constructor(private http: HttpClient) {}

  // Método para verificar si la aplicación está en el dispositivo local
  private getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return this.apiUrl2;  // Si está en el dispositivo local, usar localhost
    }
    return this.apiUrl;  // Si está en otro dispositivo, usar la IP
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token en localStorage');
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

  deleteUser(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.getApiUrl()}/user/${userId}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  restoreUser(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.getApiUrl()}/user/restore/${userId}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  getRoles(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/roles`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  createRole(roleData: { nombre: string; usuario: string; correo: string }): Observable<any> {
    return this.http.post(`${this.getApiUrl()}/roles`, roleData).pipe(
      catchError(err => throwError(err))
    );
  }

  getDeleteRoles(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/roles/delete`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  deleteRole(roleId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.getApiUrl()}/roles/${roleId}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  restoreRole(roleId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.getApiUrl()}/roles/restore/${roleId}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  changePassword(data: { contrasenaActual: string; nuevaContrasena: string }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.getApiUrl()}/change-password`, data, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }
}
