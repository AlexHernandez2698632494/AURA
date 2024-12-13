import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  registerAdmin(adminData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user`, adminData);
  }
}
