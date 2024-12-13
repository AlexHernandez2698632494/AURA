import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideLoginComponent } from '../side-login/side-login.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prueba',
  imports: [RouterOutlet, SideLoginComponent, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  title = 'login';
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  // Método que maneja el envío del formulario
  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;

      // Llamar al servicio de autenticación
      this.authService.login(username, password).subscribe({
        next: (response) => {
          // Guardar el token en el localStorage
          this.authService.saveToken(response.token);
          
          // Redirigir a la vista principal (o cualquier vista protegida)
          this.router.navigate(['/admin/index']);
        },
        error: (err) => {
          console.error('Error de autenticación', err);
          // Mostrar un mensaje de error en caso de fallo
        }
      });
    }
  }
}
