import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    RouterOutlet,
    SideComponent,
    MatButtonModule
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateAdminComponent implements OnInit {
  adminForm: FormGroup;
  availableRoles: any[] = [];  // Lista de roles disponibles (con objetos que contienen id y nombre)
  selectedRoles: any[] = [];   // Roles seleccionados por el usuario (almacenamos ids, no nombres)
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]; // Para permitir separar roles por coma

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required]],       // Validación para el campo nombre
      usuario: ['', [Validators.required]],      // Validación para el campo usuario
      correo: ['', [Validators.required, Validators.email]],  // Validación para el campo correo
      roles: [[], [Validators.required]]         // Validación para los roles seleccionados
    });
  }

  ngOnInit(): void {
    // Obtener los roles desde el backend
    this.adminService.getRoles().subscribe(
      (roles) => {
        this.availableRoles = roles; // Guardamos el rol completo (id + nombre)
      },
      (error) => {
        console.error('Error al obtener roles', error);
        Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
      }
    );
  }

  onBackClick(): void {
    // Regresar a la vista de administrador
    this.router.navigate(['/admin/index']);
  }

  onRoleSelection(event: any): void {
    // Obtener los nombres de los roles seleccionados
    const value = event.value;
    this.selectedRoles = value;
    // Actualizar los roles seleccionados en el formulario
    this.adminForm.patchValue({ roles: this.selectedRoles });
  }

  removeRole(role: string): void {
    // Remover un rol específico de la lista de roles seleccionados
    this.selectedRoles = this.selectedRoles.filter((r) => r !== role);
    this.adminForm.patchValue({ roles: this.selectedRoles });
  }

  registerAdmin(): void {
    if (this.adminForm.valid) {
      const adminData = this.adminForm.value;  // Obtener los datos del formulario

      // Convertir los nombres de los roles seleccionados a los respectivos IDs
      const rolesWithIds = this.selectedRoles.map(roleName => {
        const role = this.availableRoles.find(r => r.name === roleName);
        return role ? { id: role._id } : null;
      }).filter(role => role); // Filtrar cualquier valor nulo (en caso de que no se haya encontrado un rol)

      // Crear el payload con los roles con IDs
      const adminPayload = {
        nombre: adminData.nombre,
        usuario: adminData.usuario,
        correo: adminData.correo,
        roles: rolesWithIds  // Enviar los roles con el formato de _id
      };

      // Llamar al servicio para registrar al administrador
      this.adminService.registerAdmin(adminPayload).subscribe(
        (response) => {
          // Si el registro fue exitoso, mostramos un mensaje de éxito
          Swal.fire('Éxito', 'Administrador registrado correctamente', 'success');
          this.router.navigate(['/admin/index']);  // Redirigir al listado de administradores
        },
        (error) => {
          // Si hay error en el registro, mostramos un mensaje de error
          console.error('Error al registrar administrador', error);
          Swal.fire('Error', 'No se pudo registrar al administrador', 'error');
        }
      );
    } else {
      // Si el formulario no es válido, mostramos una advertencia
      Swal.fire('Advertencia', 'Por favor, complete todos los campos correctamente', 'warning');
    }
  }
}
