import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../../bottom-tab/bottom-tab.component';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importamos SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PremiumSideComponent,
    MatIconModule,
    BottomTabComponent,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class PremiumUsersCreateComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  subscriptions: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  isSidebarCollapsed: boolean = true;
  userForm: FormGroup;

  @Output() bodySizeChange = new EventEmitter<boolean>();

  // Nuevas variables backend
  registrationKeyFromBackend: string = '';
  correoVerificacionFromBackend: string = '';
  usuarioHistoryFromBackend: string = '';

  constructor(
    private fb: FormBuilder,
    private paymentUserService: PaymentUserService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // Se elimina llaveDeRegistro porque no se usa directamente
    });
  }

  ngOnInit(): void {
    const username = sessionStorage.getItem('usuario');
    if (username) {
      this.usuarioHistoryFromBackend = username;

      this.paymentUserService.getPaymentUserById(username).subscribe({
        next: (data) => {
          this.registrationKeyFromBackend = data?.registrationKey?.[0]?.key || '';
          this.correoVerificacionFromBackend = data?.correo?.correo || '';

          console.log('registrationKeyFromBackend:', this.registrationKeyFromBackend);
          console.log('correoVerificacionFromBackend:', this.correoVerificacionFromBackend);
          console.log('usuarioHistoryFromBackend:', this.usuarioHistoryFromBackend);
        },
        error: (err) => {
          console.error('Error al obtener datos del usuario:', err);
        }
      });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }

  onBackClick(): void {
    this.router.navigate(['/premium/users/']);
  }

  registerUser(): void {
    if (this.userForm.valid) {
      this.isLoading = true;

      const payload = {
        nombre: this.userForm.value.name,
        apellido: this.userForm.value.lastName,
        usuario: this.userForm.value.username,
        correo: this.userForm.value.email,
        correoVerificacion: this.correoVerificacionFromBackend,
        usuarioHistory: this.usuarioHistoryFromBackend,
        registrationKey: this.registrationKeyFromBackend,
      };

      console.log('Data enviada al backend:', payload);

      this.paymentUserService.register(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.router.navigate(['/premium/users']);

          // SweetAlert de éxito
          Swal.fire({
            title: '¡Éxito!',
            text: 'Usuario registrado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error al registrar el usuario.';
          console.error(error);

          // SweetAlert de error
          Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al registrar el usuario. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      });
    } else {
      console.warn('Formulario inválido');
    }
  }
}
