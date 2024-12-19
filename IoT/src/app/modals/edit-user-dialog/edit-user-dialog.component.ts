import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin.service';
import { Observable } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule, // Asegúrate de importar ReactiveFormsModule
    CommonModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css']
})
export class EditUserDialogComponent {
  roles$: Observable<any[]>; // Lista de roles disponibles
  selectedRoles: string[] = []; // IDs de los roles asignados al usuario
  initialRoles: string[] = []; // Roles iniciales del usuario (antes de ser editados)

  // Datos iniciales del usuario (usuario, correo, nombre)
  initialUsuario: string;
  initialNombre: string;
  initialCorreo: string;

  // Declarar el FormGroup para el formulario
  adminForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminService,
    private fb: FormBuilder // Inyección de FormBuilder para crear el formulario
  ) {
    // Obtener los roles disponibles desde el servicio
    this.roles$ = this.adminService.getRoles();

    // Extraer los roles actuales del usuario
    if (data.roleId && Array.isArray(data.roleId)) {
      this.initialRoles = data.roleId.map((role: any) => role._id); // Extraer los _id de los roles
      this.selectedRoles = [...this.initialRoles]; // Inicializar los roles seleccionados
    }

    // Almacenar los datos iniciales del usuario (usuario, nombre, correo)
    this.initialUsuario = data.usuario;
    this.initialNombre = data.nombre;
    this.initialCorreo = data.correo;

    // Crear el formulario con validaciones
    this.adminForm = this.fb.group({
      usuario: [this.data.usuario, Validators.required],   // Campo de usuario con validación de requerido
      nombre: [this.data.nombre, Validators.required],     // Campo de nombre con validación de requerido
      correo: [this.data.correo, [Validators.required, Validators.email]], // Campo de correo con validación de requerido y formato de email
      roles: [this.selectedRoles] // Los roles no tienen validación, pero se usan para controlarlos
    });
  }

  onSave() {
    const updatedUserData: any = {};
  
    // Verificar si los datos del usuario (nombre, usuario, correo) han cambiado
    if (this.data.usuario !== this.initialUsuario) {
      updatedUserData.usuario = this.data.usuario;
    }
  
    if (this.data.nombre !== this.initialNombre) {
      updatedUserData.nombre = this.data.nombre;
    }
  
    if (this.data.correo !== this.initialCorreo) {
      updatedUserData.correo = this.data.correo;
    }
  
    // Verificar si los roles han cambiado
    if (JSON.stringify(this.selectedRoles) !== JSON.stringify(this.initialRoles)) {
      updatedUserData.roleId = [...this.selectedRoles]; // Si se agregan o cambian roles
    }
  
    // Si se han eliminado roles, agregarlos al campo removeRoleId
    const removedRoles = this.initialRoles.filter(role => !this.selectedRoles.includes(role));
    if (removedRoles.length > 0) {
      updatedUserData.removeRoleId = removedRoles; // Roles eliminados
    }
  
    // Si no hay cambios en ningún campo, no enviamos la solicitud
    if (Object.keys(updatedUserData).length === 0) {
      return; // No enviamos la solicitud si no hay cambios
    }
  
    // Llamada al servicio para actualizar los datos del usuario
    this.adminService.updateUser(this.data._id, updatedUserData).subscribe({
      next: (response) => {
        console.log('Usuario actualizado:', response);
        
        // Mostrar mensaje de éxito con SweetAlert2
        Swal.fire({
          title: 'Éxito!',
          text: 'El usuario se ha actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
  
        this.dialogRef.close(response.user); // Devuelve los datos actualizados
      },
      error: (err) => {
        console.error('Error actualizando el usuario:', err);
        
        // Mostrar mensaje de error con SweetAlert2
        Swal.fire({
          title: 'Error!',
          text: 'Ocurrió un error al actualizar el usuario. Intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }  

  onCancel() {
    this.dialogRef.close();
  }
}
