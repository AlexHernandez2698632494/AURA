import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; // Importar SweetAlert2

@Component({
  selector: 'app-create',
  imports: [RouterOutlet, SideComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateAdminComponent {
  adminForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required]],
      usuario: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
    });
  }

  onBackClick(): void {
    this.router.navigate(['/admin/index']);
  }

  registerAdmin(): void {
    if (this.adminForm.valid) {
      this.adminService.registerAdmin(this.adminForm.value).subscribe(
        (response) => {
          // Mostrar mensaje de éxito
          Swal.fire({
            icon: 'success',
            title: 'Administrador registrado',
            text: 'El administrador se registró correctamente.',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            // Redirigir después de cerrar el SweetAlert
            this.router.navigate(['/admin/index']);
          });
        },
        (error) => {
          // Mostrar mensaje de error
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'Hubo un problema al registrar el administrador.',
            footer: 'Por favor, inténtelo nuevamente.',
            confirmButtonText: 'Aceptar'
          });
        }
      );
    } else {
      // Mostrar mensaje de formulario inválido
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, complete todos los campos requeridos.',
        confirmButtonText: 'Aceptar'
      });
    }
  }
}
