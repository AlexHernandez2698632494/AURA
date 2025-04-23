import { Component } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiConfigService } from '../../services/ApiConfig/api-config.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NavComponent, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  title = 'login';

  usernameOrEmail: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router, private apiConfig: ApiConfigService) {}

  private getApiUrl(): string {
    return this.apiConfig.getApiUrl();
  }

  ngOnInit() {
    this.http.get(`${this.getApiUrl()}/oauth2/users/exist`).subscribe(
      (response: any) => {
        if (!response.usersExist) {
          this.router.navigate(['/register-superadmin']);
        }
      },
      (error) => {
        console.error('Error verificando existencia de usuarios:', error);
      }
    );
  }

  login() {
    if (!this.usernameOrEmail || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos.';
      return;
    }

    const loginData = {
      identifier: this.usernameOrEmail,
      contrasena: this.password,
    };

    this.http.post(`${this.getApiUrl()}/oauth2/login`, loginData).subscribe(
      (response: any) => {
        if (response.token) {
          this.handleSuccessfulLogin(response);
        } else {
          this.errorMessage = 'Inicio de sesión fallido. Verifique sus credenciales.';
        }
      },
      (error) => {
        console.error('Error en el login:', error);
        this.errorMessage = error.error?.message || 'No se pudo iniciar sesión. Intente más tarde.';
      }
    );
  }

  redirectToRegister() {
    this.router.navigate(['/registrate']);
  }

  handleSuccessfulLogin(response: any) {
    console.log('Token recibido:', response.token);
    sessionStorage.setItem('token', response.token);
  
    if (response.user) {
      const nombre = response.user.nombre || '';
      const apellido = response.user.apellido || '';
      const username = response.user.usuario;
      const fullname = `${nombre} ${apellido}`.trim();
  
      sessionStorage.setItem('username', fullname);
      sessionStorage.setItem('usuario', username);
  
      // Ahora authorities siempre tiene [rol, fiware-service]
      let authorities: any[] = response.user.authorities || [];
  
      // Si viene como array anidado, lo aplanamos
      if (Array.isArray(authorities[0])) {
        authorities = authorities[0];
      }
  
      const rol = authorities[0] || 'sin_rol';
      const fiwareService = authorities[1] || 'default';
      console.log(rol, fiwareService);
      sessionStorage.setItem('authorities', JSON.stringify(authorities));
      sessionStorage.setItem('fiware-service', fiwareService.toLowerCase());
      sessionStorage.setItem('fiware-servicepath', '/#'); // Puedes cambiarlo si necesitas hacerlo dinámico más adelante
  
      // Alerta especial si es dev
      if (rol.includes('dev')) {
        Swal.fire({
          title: 'Bienvenido al modo Programador',
          text: 'Has iniciado sesión como desarrollador.',
          icon: 'success',
          confirmButtonText: 'Entendido',
        });
      }
  
      const routes: { [key: string]: string } = {
        'super_administrador': '/admin/index',
        'dev': '/admin/index',
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
        'super_usuario': '/overview'
      };
  
      const routeToNavigate = routes[rol] || '/';
  
      this.router.navigate([routeToNavigate]);
    } else {
      console.warn('No se recibieron datos del usuario en la respuesta');
    }
  }
  }
