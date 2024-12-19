import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';  // Importar SweetAlert2

@Component({
  selector: 'app-index-delete-role',
  imports: [RouterOutlet, 
    SideComponent, 
    FormsModule, 
    CommonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
  ],
  templateUrl: './index-delete-role.component.html',
  styleUrl: './index-delete-role.component.css'
})
export class IndexDeleteRoleComponent {
  roles: any[] = []; // Lista de roles
  searchTerm: string = ''; // Valor del input de búsqueda
  recordsToShow: number = 5; // Número de registros a mostrar por página
  currentPage: number = 1; // Página actual
  Math = Math;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit() {
    this.loadRoles();
  }

  // Carga los roles desde el servicio
  loadRoles() {
    const token = localStorage.getItem('token');  // Recuperamos el token desde localStorage

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

    this.adminService.getDeleteRoles().subscribe({
      next: (data) => {
        this.roles = data; // Asignamos los roles
        console.log('Roles cargados:', this.roles); // Verifica si llegan correctamente
      },
      error: (err) => {
        console.error('Error al cargar los roles:', err);
      }
    });
  }


  // Filtra roles según el término de búsqueda
  filteredRoles() {
    const filtered = this.roles.filter(role =>
      role.name && role.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtered.slice(start, end);
  }


  // Calcula el total de páginas
  totalPages() {
    return Math.ceil(this.roles.length / this.recordsToShow);
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

  // Métodos para manejar acciones
  restoreRole(roleId: string, roleName: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Está seguro que desea restaurar el rol: "${roleName}"?`,
      icon: 'warning',
      showCancelButton: true,
      cancelButtonColor: '#3085d6',
      confirmButtonColor: '#008f1f',
      cancelButtonText: 'cancelar',
      confirmButtonText: 'restaurar',
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
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

        this.adminService.restoreRole(roleId).subscribe({
          next: (response) => {
            Swal.fire(
              'Restaurado',
              `El rol "${roleName}" ha sido restaurado exitosamente.`,
              'success'
            );
            this.loadRoles(); // Recargar la lista de roles
          },
          error: (err) => {
            console.error('Error al eliminar el rol:', err);
            Swal.fire(
              'Error',
              'Ocurrió un error al intentar eliminar el rol. Por favor, intenta de nuevo.',
              'error'
            );
          }
        });
      }
    });
  }

}
