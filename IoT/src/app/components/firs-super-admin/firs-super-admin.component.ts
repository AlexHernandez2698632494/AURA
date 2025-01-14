import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { ApiConfigService } from '../../services/ApiConfig/api-config.service';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms'; // Para manejar ngModel
import { HttpClientModule } from '@angular/common/http'; // Para solicitudes HTTP
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf

@Component({
  selector: 'app-register-first-admin',
  standalone: true, // Componente standalone
  imports: [RouterOutlet, NavComponent, FormsModule, HttpClientModule, CommonModule], // Agregar CommonModule
  templateUrl: './firs-super-admin.component.html',
  styleUrls: ['./firs-super-admin.component.css'],
})
export class FirsSuperAdminComponent implements OnInit {
  nombre: string = '';
  correo: string = '';
  usuario: string = '';
  usuarioHistory: string = ''; // Un campo para capturar el usuario que lo está registrando
  autoridadId: string = ''; // El ID de la autoridad de superadmin
  errorMessage: string = '';
  availableAuthorities: any[] = []; // Lista de autoridades disponibles

  constructor(private http: HttpClient, private router: Router, private apiConfig: ApiConfigService) {}

  ngOnInit() {
    this.getAuthorities(); // Cargar las autoridades disponibles al iniciar
  }

  private getApiUrl(): string {
    return this.apiConfig.getApiUrl();
  }

  // Método para obtener las autoridades del backend
  private getAuthorities(): void {
    this.http.get<any[]>(`${this.getApiUrl()}/authorities`).subscribe(
      (response) => {
        this.availableAuthorities = response;
      },
      (error) => {
        console.error('Error al obtener las autoridades', error);
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudieron cargar las autoridades.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    );
  }

  registerFirstAdmin() {
    if (!this.nombre || !this.correo || !this.usuario || !this.autoridadId) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }

    const newAdmin = {
      nombre: this.nombre,
      correo: this.correo,
      usuario: this.usuario,
      usuarioHistory: this.usuarioHistory,
      autoridadId: this.autoridadId,
    };

    this.http.post(`${this.getApiUrl()}/register-superadmin`, newAdmin).subscribe(
      (response: any) => {
        // Mostrar un mensaje de éxito con SweetAlert2
        Swal.fire({
          title: '¡Éxito!',
          text: 'El primer superadmin ha sido registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        }).then(() => {
          // Redirigir al login después de cerrar la alerta
          this.router.navigate(['/login']);
        });
      },
      (error) => {
        // Mostrar un mensaje de error con SweetAlert2
        Swal.fire({
          title: '¡Error!',
          text: error.error?.message || 'Error al registrar el primer superadministrador.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    );
  }
}
