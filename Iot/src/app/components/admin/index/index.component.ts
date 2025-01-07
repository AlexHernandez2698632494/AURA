import { Component, OnInit } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { NavComponent } from '../../nav/nav.component';
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
  selector: 'app-index-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    NavComponent,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexAdminComponent implements OnInit {
  users: any[] = [];
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  Math = Math;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private dialog: MatDialog // Inyectar MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Carga los usuarios desde el servicio
  loadUsers() {
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

    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Usuarios cargados:', this.users);
      },
      error: (err) => {
        console.error('Error al cargar los usuarios:', err);
      }
    });
  }

  filteredUsers() {
    const filtered = this.users.filter(user =>
      user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.usuario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtered.slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.users.length / this.recordsToShow);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '400px',
      data: { ...user }, // Pasa una copia del usuario al modal
    });
  
    dialogRef.afterClosed().subscribe((updatedUser) => {
      if (updatedUser) {
        // Asegúrate de pasar ambos parámetros: el userId y el userData
        this.adminService.updateUser(updatedUser._id, updatedUser).subscribe({
          next: (data) => {
            // Si la actualización en el servidor fue exitosa, entonces actualiza la tabla
            const index = this.users.findIndex(u => u._id === updatedUser._id);
            if (index > -1) {
              this.users[index] = { ...updatedUser }; // Sobrescribe los datos del usuario con los nuevos datos
            }
          },
          error: (err) => {
            console.error('Error al actualizar el usuario:', err);
          }
        });
      }
    });
  }  
  
deleteUser(user: any) {
    // Mostrar un cuadro de confirmación con el nombre del usuario
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro que deseas eliminar el usuario ${user.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamar al servicio para eliminar el usuario
        this.adminService.deleteUser(user._id).subscribe({
          next: (response) => {
            Swal.fire('Eliminado!', `El usuario ${user.nombre} ha sido eliminado correctamente.`, 'success');
            // Eliminar el usuario localmente de la lista
            this.users = this.users.filter(u => u._id !== user._id);
          },
          error: (err) => {
            Swal.fire('Error', `No se pudo eliminar el usuario ${user.nombre}.`, 'error');
            console.error('Error al eliminar el usuario:', err);
          }
        });
      }
    });
  }
}   