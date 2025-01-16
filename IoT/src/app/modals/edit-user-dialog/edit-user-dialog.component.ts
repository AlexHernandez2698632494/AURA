import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../services/admin/admin.service';
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
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.css'],
})
export class EditUserDialogComponent {
  authorities$: Observable<any[]>; // Lista de autoridades disponibles
  selectedAuthorities: string[] = []; // IDs de las autoridades asignadas al usuario
  initialAuthorities: string[] = []; // Autoridades iniciales del usuario (antes de ser editadas)

  initialUsuario: string;
  initialNombre: string;
  initialCorreo: string;

  adminForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    // Obtener las autoridades disponibles desde el servicio
    this.authorities$ = this.adminService.getAuthorities();

    // Extraer las autoridades actuales del usuario
    if (data.authorities && Array.isArray(data.authorities)) {
      this.initialAuthorities = data.authorities.map((authority: any) => authority._id); // Extraer los _id de las autoridades
      this.selectedAuthorities = [...this.initialAuthorities]; // Inicializar las autoridades seleccionadas
    }

    this.initialUsuario = data.usuario;
    this.initialNombre = data.nombre;
    this.initialCorreo = data.correo;

    this.adminForm = this.fb.group({
      usuario: [this.data.usuario, Validators.required],
      nombre: [this.data.nombre, Validators.required],
      correo: [this.data.correo, [Validators.required, Validators.email]],
      authorities: [this.selectedAuthorities],
    });
  }

 onSave() {
    const updatedUserData: any = {};
    if (this.data.usuario !== this.initialUsuario) {
      updatedUserData.usuario = this.data.usuario;
    }
    if (this.data.nombre !== this.initialNombre) {
      updatedUserData.nombre = this.data.nombre;
    }
    if (this.data.correo !== this.initialCorreo) {
      updatedUserData.correo = this.data.correo;
    }
    if (JSON.stringify(this.selectedAuthorities) !== JSON.stringify(this.initialAuthorities)) {
      updatedUserData.authorities = [...this.selectedAuthorities]; // Si se agregan o cambian autoridades
    }
    const removedAuthorities = this.initialAuthorities.filter(
      (authority) => !this.selectedAuthorities.includes(authority)
    );
    if (removedAuthorities.length > 0) {
      updatedUserData.removeAuthorities = removedAuthorities; // Autoridades eliminadas
    }
    if (Object.keys(updatedUserData).length === 0) {
      return;
    }
    this.adminService.updateUser(this.data._id, updatedUserData).subscribe({
      next: (response) => {
        Swal.fire({
          title: 'Éxito!',
          text: 'El usuario se ha actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
        this.dialogRef.close(response.user);
      },
      error: (err) => {
        Swal.fire({
          title: 'Error!',
          text: 'Ocurrió un error al actualizar el usuario. Intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  onCancel() {
    this.dialogRef.close();
  }
}
