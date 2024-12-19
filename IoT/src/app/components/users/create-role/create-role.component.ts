import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-role',
  imports: [RouterOutlet, 
    SideComponent, 
    CommonModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']
})
export class CreateRoleComponent {
  roleForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    // Formulario con un único campo: 'name'
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
    });
  }

  onBackClick(): void {
    this.router.navigate(['/admin/index']);
  }

  registerRole() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value; // Solo contiene { name }

      this.adminService.createRole(roleData).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Rol registrado',
            text: 'El rol se ha registrado correctamente.',
          });
          this.router.navigate(['/users/roles']);
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar rol',
            text: err.error?.message || 'Ocurrió un error inesperado.',
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor, complete el nombre del rol.',
      });
    }
  }
}