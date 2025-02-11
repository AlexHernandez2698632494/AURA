import { Component } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { FormsModule } from '@angular/forms'; 
import { HttpClientModule } from '@angular/common/http'; 
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';  // Importamos MatIconModule
import Swal from 'sweetalert2';
import { PaymentUserService } from '../../services/paymentUser/payment-user.service';  // Importamos el servicio

@Component({
  selector: 'app-register',
  standalone: true,  // Componente standalone
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
    private paymentUserService: PaymentUserService  // Inyectamos el servicio
  ) {}

  // Método para registrar al usuario
  register() {
    
  }
  

  // Redirige al login
  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
