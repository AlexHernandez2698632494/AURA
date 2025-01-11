import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private apiUrlLocal = 'http://localhost:3000'; // URL para desarrollo en localhost
  private apiUrlNetwork = 'http://192.168.1.82:3000'; // URL para acceder desde otro dispositivo

  constructor(private http: HttpClient) {}

  /**
   * Determina la URL base dependiendo del entorno.
   */
  private getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return this.apiUrlLocal;
    }
    return this.apiUrlNetwork;
  }

  /**
   * Genera los encabezados de autorización.
   */
  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token en sessionStorage');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Obtiene todas las entradas de historial activas (estadoEliminacion = 0).
   */
  getHistory(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/history`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  /**
   * Obtiene las entradas de historial eliminadas (estadoEliminacion = 1).
   */
  getDeletedHistory(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.getApiUrl()}/history/delete`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

  /**
   * Elimina lógicamente una entrada de historial (estadoEliminacion = 1).
   */
  deleteHistory(historyId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log(`Eliminando historial con ID: ${historyId}`);
    return this.http.delete(`${this.getApiUrl()}/history/${historyId}`, { headers }).pipe(
      catchError(err => {
        console.error('Error al eliminar historial', err);
        return throwError(err);
      })
    );
  }
  

  /**
   * Elimina lógicamente todas las entradas de historial con un nivel específico.
   */
  deleteStateByLevel(level: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.getApiUrl()}/history/delete/${level}`, { headers }).pipe(
      catchError(err => throwError(err))
    );
  }

 /**
   * Elimina permanentemente una entrada de historial.
   */
 cleanSlateByLevel(level: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.delete(`${this.getApiUrl()}/history/${level}/CleanSlate`, { headers }).pipe(
    catchError(err => throwError(err))
  );
}

permanentDeleteHistory(historyId: string): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.patch(`${this.getApiUrl()}/history/${historyId}/permanent`, {}, { headers }).pipe(
    catchError(err => throwError(err))
  );
}

}
