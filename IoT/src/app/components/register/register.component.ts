import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http'; 
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; 
import Swal from 'sweetalert2';
import { PaymentUserService } from '../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-register',
  standalone: true, 
  imports: [RouterOutlet, NavComponent, FormsModule, HttpClientModule, CommonModule, MatIconModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  usernameOrEmail: string = '';
  name: string = '';
  lastname: string = '';
  email: string = '';
  registrationKey: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private paymentUserService: PaymentUserService  
  ) {}

  // Método para registrar al usuario
register() {
  // Los nombres de los campos deben coincidir con los que espera el servidor
  const paymentUserData = {
    nombre: this.name,  // Cambié "name" por "nombre"
    apellido: this.lastname,  // Cambié "lastname" por "apellido"
    usuario: this.usernameOrEmail,  // Cambié "usernameOrEmail" por "usuario"
    correo: this.email,  // Cambié "email" por "correo"
    registrationKey: this.registrationKey  // Dejé "registrationKey" como está
  };

  this.paymentUserService.register(paymentUserData).subscribe(
    (response) => {
      Swal.fire('Éxito', 'Usuario registrado correctamente', 'success');
      this.redirectToLogin();
    },
    (error) => {
      this.errorMessage = 'Hubo un error al registrar al usuario. Intenta nuevamente.';
      console.error(error);
    }
  );
}


  // Redirige al login
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
