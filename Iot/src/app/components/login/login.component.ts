import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms'; // Para manejar ngModel
import { HttpClientModule } from '@angular/common/http'; // Para solicitudes HTTP
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf
import { ApiConfigService } from '../../services/ApiConfig/api-config.service';
import Swal from 'sweetalert2';

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

  constructor(private http: HttpClient, private router: Router, private apiConfig: ApiConfigService) {}

  // Método para obtener la URL correcta dependiendo del entorno
  private getApiUrl():string{
    return this.apiConfig.getApiUrl();
  }
  ngOnInit() {
    this.http.get(`${this.getApiUrl()}/users/exist`).subscribe(
      (response: any) => {
        if (!response.usersExist) {
          // Redirigir a la vista de registro del superadministrador
          this.router.navigate(['/register-superadmin']);
        }
      },
      (error) => {
        console.error('Error verificando existencia de usuarios:', error);
      }
    );
  }
  
  // Método para manejar el inicio de sesión
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

  // Intentar login en la primera ruta
  this.http.post(`${this.getApiUrl()}/login`, loginData).subscribe(
    (response: any) => {
      if (response.token) {
        this.handleSuccessfulLogin(response);
      } else {
        console.error('No se recibió un token en la respuesta de la primera API');
        this.errorMessage = '';  // Limpiamos el mensaje de error antes de probar la siguiente ruta
        // Intentar login en la segunda ruta
        this.loginFallback(loginData, 2);  // Paso a la segunda ruta
      }
    },
    (error) => {
      console.error('Error en el login de la primera API:', error);
      this.errorMessage =
        error.error?.message || 'Error al iniciar sesión. Intentando con la segunda ruta...';
      // Intentar login en la segunda ruta
      this.loginFallback(loginData, 2);  // Paso a la segunda ruta
    }
  );
}

// Método para intentar el login en las rutas fallback
loginFallback(loginData: any, routeAttempt: number) {
  let route = '';
  
  if (routeAttempt === 2) {
    route = '/dev/login';  // Segunda ruta
  } else if (routeAttempt === 3) {
    route = '/payment/user/login';  // Tercera ruta
  }

  this.http.post(`${this.getApiUrl()}${route}`, loginData).subscribe(
    (response: any) => {
      if (response.token) {
        this.handleSuccessfulLogin(response);
      } else {
        console.error(`No se recibió un token en la respuesta de la ruta ${route}`);
        if (routeAttempt < 3) {
          this.errorMessage = `Error al procesar el inicio de sesión en la ruta ${route}.`;
        }
      }
    },
    (error) => {
      console.error(`Error en el login de la ruta ${route}:`, error);
      if (routeAttempt < 3) {
        this.loginFallback(loginData, routeAttempt + 1);  // Intentar con la siguiente ruta
      } else {
        this.errorMessage = 'Error al iniciar sesión en las tres rutas. Por favor, intente más tarde.';
      }
    }
  );
}


redirectToRegister() {
  this.router.navigate(['/registrate']);
}

// Método para manejar el inicio de sesión exitoso
handleSuccessfulLogin(response: any) {
  console.log('Token recibido:', response.token);
  sessionStorage.setItem('token', response.token); // Guarda el token en sessionStorage

  if (response.user) {
    const nombre = response.user.nombre || ''; // Extrae el nombre de usuario, si existe
    const apellido = response.user.apellido || '';
    let fullname = `${nombre}  ${apellido}`; 
    console.log("usuario", fullname);
    sessionStorage.setItem('username', fullname); // Guarda el nombre del usuario

    if (response.user.authorities) {
      const authorities = Array.isArray(response.user.authorities)
        ? response.user.authorities
        : [response.user.authorities]; // Asegúrate de que sea un array
      console.log('Authorities recibidos:', authorities);
      sessionStorage.setItem('authorities', JSON.stringify(authorities)); // Guarda los roles en sessionStorage

      // Mostrar el SweetAlert si el usuario tiene el rol 'dev'
      if (authorities.includes('dev')) {
        Swal.fire({
          title: 'Bienvenido al modo Programador',
          text: 'Has iniciado sesión como desarrollador.',
          icon: 'success',
          confirmButtonText: 'Entendido',
        });
      }

      let routeToNavigate = '/'; // Ruta predeterminada si no hay roles específicos
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
        'super_usuario':'/subscriptions'
      };

      // Determinar la ruta a la que redirigir según las autoridades
      for (let authority of authorities) {
        if (routes[authority]) {
          routeToNavigate = routes[authority];
          break;
        }
      }

      // Redirigir al usuario a la ruta determinada
      this.router.navigate([routeToNavigate]);
    } else {
      console.warn('No se recibieron authorities en la respuesta del usuario');
    }
  } else {
    console.warn('No se recibieron datos del usuario en la respuesta');
  }
}

}
