import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';  // Importar SweetAlert2

@Component({
  selector: 'app-index-e-admin',
  imports: [
    SideComponent, 
    BottomTabComponent,
    FormsModule, 
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './index-e.component.html',
  styleUrl: './index-e.component.css'
})
export class IndexEAdminComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true
  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  users: any[] = []; 
  searchTerm: string = ''; 
  recordsToShow: number = 5; 
  currentPage: number = 1; 
  Math = Math;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const token = sessionStorage.getItem('token');  // Recuperamos el token desde localStorage

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

    this.adminService.getDeleteUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Usuarios cargados:', this.users);  // Asegúrate de que esta línea muestra los usuarios correctamente.
      },
      error: (err) => {
        console.error('Error al cargar los usuarios:', err);
      }
    });
    
  }


  filteredUsers() {
    const filtered = this.users.filter(user =>
      (user.nombre && user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())) || 
      (user.name && user.name.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtered.slice(start, end);
  }
  

  // Calcula el total de páginas
  totalPages() {
    return Math.ceil(this.users.length / this.recordsToShow);
  }

  // Cambia a la página siguiente
  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  // Cambia a la página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

 // Función para restaurar el usuario
 restoreUser(userId: string, userName: string) {
  // Obtener el username desde sessionStorage
  const usuarioHistory = sessionStorage.getItem('username'); // Asegúrate de que 'username' esté guardado en sessionStorage.

  if (!usuarioHistory) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se encontró el usuario en la sesión. Por favor, inicia sesión nuevamente.',
    });
    return;
  }

  Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Quieres restaurar al usuario ${userName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, restaurar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.adminService.restoreUser(userId, usuarioHistory).subscribe({
        next: () => {
          Swal.fire(
            'Restaurado!',
            `El usuario ${userName} ha sido restaurado.`,
            'success'
          );
          this.loadUsers();  // Vuelve a cargar la lista de usuarios restaurados.
        },
        error: (err) => {
          Swal.fire(
            'Error!',
            'No se pudo restaurar al usuario.',
            'error'
          );
        }
      });
    }
  });
}
}
