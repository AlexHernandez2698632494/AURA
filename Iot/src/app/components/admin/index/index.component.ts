import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import { EditUserDialogComponent } from '../../../modals/edit-user-dialog/edit-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { DevService } from '../../../services/dev/dev.service';

@Component({
  selector: 'app-index-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    SideComponent,
    BottomTabComponent,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexAdminComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  isDev: boolean = false; 
  @Output() bodySizeChange = new EventEmitter<boolean>();
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true
  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  userType: string = 'admin';
  users: any[] = [];
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  Math = Math;
  userPermissions: string[] = []; // Almacenar permisos del usuario

  constructor(
    private adminService: AdminService,
    private devService:DevService,
    private router: Router,
    private dialog: MatDialog // Inyectar MatDialog
  ) { }

  ngOnInit() {
    this.loadPermissions(); // Cargar permisos al iniciar
    this.loadData();

    // Verificar si el valor en sessionStorage es 'dev'
    const authorities = sessionStorage.getItem('authorities');
    if (authorities && JSON.parse(authorities).includes('dev')) {
      this.isDev = true;
    }
  }

  loadData() {
    if (this.userType === 'dev') {
      this.loadProgrammers();  // Cargar usuarios desde adminService.
    } else {
      this.loadUsers();  // Cargar programadores desde devService.
    }
  }

  // Cargar los permisos del usuario desde sessionStorage
  loadPermissions() {
    const authorities = sessionStorage.getItem('authorities');
    if (authorities) {
      this.userPermissions = JSON.parse(authorities);
    }
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.userPermissions.includes(permission));
  }

  // Carga los usuarios desde el servicio
  loadUsers() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No se encuentra el token',
        text: 'Por favor, inicie sesión nuevamente.',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Usuarios cargados:', this.users);
      },
      error: (err) => {
        console.error('Error al cargar los usuarios:', err);
      },
    });
  }

  // Cargar programadores (dev)
  loadProgrammers() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No se encuentra el token',
        text: 'Por favor, inicie sesión nuevamente.',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.devService.getDevUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Programadores cargados:', this.users);
      },
      error: (err) => {
        console.error('Error al cargar los programadores:', err);
      },
    });
  }

  // Función para manejar el cambio de selección del tipo de usuario
  onUserTypeChange(type: string) {
    this.userType = type;
    this.loadData();  // Recargar los datos según la selección del radio button.
  }

  filteredUsers() {
    const filtered = this.users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.apellido.toLowerCase().includes(this.searchTerm.toLowerCase())||
        user.usuario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.correo.correo.toLowerCase().includes(this.searchTerm.toLowerCase())
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
        this.adminService.updateUser(updatedUser._id, updatedUser).subscribe({
          next: (data) => {
            const index = this.users.findIndex((u) => u._id === updatedUser._id);
            if (index > -1) {
              this.users[index] = { ...updatedUser };
            }
          },
          error: (err) => {
            console.error('Error al actualizar el usuario:', err);
          },
        });
      }
    });
  }

  deleteUser(user: any) {
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
        const usuarioHistory = sessionStorage.getItem('username');
        if (!usuarioHistory) {
          Swal.fire('Error', 'No se encontró el usuario autenticado en sessionStorage.', 'error');
          return;
        }

        this.adminService.deleteUser(user._id, usuarioHistory).subscribe({
          next: (response) => {
            Swal.fire('Eliminado!', `El usuario ${user.nombre} ha sido eliminado correctamente.`, 'success');
            this.users = this.users.filter((u) => u._id !== user._id);
          },
          error: (err) => {
            Swal.fire('Error', `No se pudo eliminar el usuario ${user.nombre}.`, 'error');
            console.error('Error al eliminar el usuario:', err);
          },
        });
      }
    });
  }
}
