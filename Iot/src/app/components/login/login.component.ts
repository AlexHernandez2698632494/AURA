import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms'; // Para manejar ngModel
import { HttpClientModule } from '@angular/common/http'; // Para solicitudes HTTP
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf

@Component({
  selector: 'app-login',
  standalone: true, // Componente standalone
  imports: [RouterOutlet,  NavComponent, FormsModule, HttpClientModule, CommonModule], // Agregar CommonModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'], // styleUrls en plural
})
export class LoginComponent {
  title = 'login';

  // Variables para capturar datos del formulario
  usernameOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  // Método para obtener la URL correcta dependiendo del entorno
  private getApiUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';  // Si está en el dispositivo local, usar localhost
    }
    return 'http://192.168.1.14:3000'; // Si está en otro dispositivo, usar la IP
  }

  // Método para manejar el inicio de sesión
  login() {
    if (!this.usernameOrEmail || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }
  
    const loginData = {
      identifier: this.usernameOrEmail,
      contrasena: this.password,
    };
  
    // Usamos la URL correcta dependiendo del entorno
    this.http.post(`${this.getApiUrl()}/login`, loginData).subscribe(
      (response: any) => {
        // Verifica que el token esté en la respuesta
        if (response.token) {
          console.log('Token recibido:', response.token);
          localStorage.setItem('token', response.token); // Guarda el token en localStorage
  
          // Maneja los authorities (roles del usuario)
          if (response.user && response.user.authorities) {
            const authorities = Array.isArray(response.user.authorities) ? response.user.authorities : [response.user.authorities]; // Asegúrate de que sea un array
            console.log('Authorities recibidos:', authorities);
            localStorage.setItem('authorities', JSON.stringify(authorities)); // Guarda los roles en localStorage
  
            // Lógica para redirigir según el role
            let routeToNavigate = '/';  // Ruta predeterminada si no hay roles específicos

            // Definir las rutas de acuerdo a las autoridades
            const routes: { [key: string]: string } = {
              'super_administrador': '/admin/index',
              'administrador': '/admin/index',
              'list_alert': '/alert/index',
              'list_sensors': '/sensors/index',
              'list_suscriptions': '/suscription/index',
              'list_users': '/admin/index',
              'list_iot_service': '/services/index',
              'create_alert': '/alert/create',
              'create_sensors': '/sensors/create',
              'create_suscription': '/suscription/create',
              'create_users': '/admin/create',
              'create_iot_service': '/services/create',
              'edit_alert': '/alert/index',
              'edit_sensors': '/sensors/index',
              'edit_suscription': '/suscription/index',
              'edit_user': '/admin/index',
              'edit_iot_service': '/services/index',
              'delete_alert': '/alert/index',
              'delete_sensors': '/sensors/index',
              'delete_suscription': '/suscription/index',
              'delete_user': '/admin/index',
              'delete_iot_service': '/services/index',
            };

            // Determinar la ruta a la que redirigir según las autoridades
            for (let authority of authorities) {
              if (routes[authority]) {
                routeToNavigate = routes[authority];
                break;  // Salir del ciclo al encontrar la primera autoridad válida
              }
            }

            // Redirigir al usuario a la ruta determinada
            this.router.navigate([routeToNavigate]);
          } else {
            console.warn('No se recibieron authorities en la respuesta del usuario');
          }
        } else {
          console.error('No se recibió un token en la respuesta');
          this.errorMessage = 'Error al procesar el inicio de sesión.';
        }
      },
      (error) => {
        console.error('Error en el login:', error);
        this.errorMessage =
          error.error?.message || 'Error al iniciar sesión. Inténtelo de nuevo.';
      }
    );
  }
}
