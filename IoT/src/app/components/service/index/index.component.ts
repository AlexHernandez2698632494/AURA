import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';  // Importar SweetAlert2
import { EditUserDialogComponent } from '../../../modals/edit-user-dialog/edit-user-dialog.component';

import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-index',
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    SideComponent,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexServiceComponent implements OnInit {

  constructor(
    private adminService: AdminService,
    private router: Router,
    private dialog: MatDialog // Inyectar MatDialog
  ) { }
  ngOnInit() {
    this.loadServices();
  }

  // Carga los usuarios desde el servicio
  loadServices() {
    const token = sessionStorage.getItem('token');  // Recuperamos el token desde sessionStorage

    if (!token) {
      // Mostrar una alerta si no se encuentra el token
      Swal.fire({
        icon: 'error',
        title: 'No se encuentra el token',
        text: 'Por favor, inicie sesión nuevamente.',
      }).then(() => {
        // Opcional: Redirigir al usuario a la página de login
        this.router.navigate(['/login']);
      });
      return;  // No continuar si no hay token
    }
  }

  editService() {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '400px',
    });
  }  

  deleteService() {
      // Mostrar un cuadro de confirmación con el nombre del usuario
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Estás seguro que deseas eliminar el servicio?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Eliminado!', `El servicio ha sido eliminado correctamente.`, 'success');
        }
      });
    }
}
