import { Component, OnInit } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';  // Importar SweetAlert2

@Component({
  selector: 'app-index-role',
  imports: [RouterOutlet, SideComponent, FormsModule, CommonModule],
  templateUrl: './index-role.component.html',
  styleUrl: './index-role.component.css'
})
export class IndexRoleComponent implements OnInit {
  roles: any[] = []; // Lista de roles
  searchTerm: string = ''; // Valor del input de búsqueda
  recordsToShow: number = 5; // Número de registros a mostrar por página
  currentPage: number = 1; // Página actual
  Math = Math;

  constructor(private adminService: AdminService, private router: Router) {}

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
    
    this.adminService.getRoles().subscribe({
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
  editRole(role: any) {
    console.log('Editar rol:', role);
  }

  deleteRole(roleId: string) {
    console.log('Eliminar rol con ID:', roleId);
  }
}
