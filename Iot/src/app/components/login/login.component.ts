import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideLoginComponent } from "../side-login/side-login.component";
import { FormsModule } from '@angular/forms'; // Para manejar ngModel
import { HttpClientModule } from '@angular/common/http'; // Para solicitudes HTTP
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf

@Component({
  selector: 'app-prueba',
  standalone: true, // Componente standalone
  imports: [RouterOutlet, SideLoginComponent, FormsModule, HttpClientModule, CommonModule], // Agregar CommonModule
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
  
    this.http.post('http://localhost:3000/login', loginData).subscribe(
      (response: any) => {
        // Verifica que el token esté en la respuesta
        if (response.token) {
          console.log('Token recibido:', response.token);
          localStorage.setItem('token', response.token); // Guarda el token en localStorage
          this.router.navigate(['/admin/index']); // Redirige al dashboard
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
