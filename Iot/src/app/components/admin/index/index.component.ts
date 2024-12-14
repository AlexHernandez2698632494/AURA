import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterOutlet, SideComponent, FormsModule, CommonModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexAdminComponent implements OnInit {
  users: any[] = []; // Lista de usuarios
  searchTerm: string = ''; // Valor del input de búsqueda
  recordsToShow: number = 5; // Número de registros a mostrar por página
  currentPage: number = 1; // Página actual
  Math = Math;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Carga los usuarios desde el servicio
  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Usuarios cargados:', this.users); // Verifica si llegan los datos correctamente
      },
      error: (err) => {
        console.error('Error al cargar los usuarios:', err);
        // Aquí puedes manejar el error, como redirigir al login si el token es inválido
      }
    });
  }

  // Filtra usuarios según el término de búsqueda
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

  // Métodos para manejar acciones
  editUser(user: any) {
    console.log('Editar usuario:', user);
  }

  deleteUser(userId: string) {
    console.log('Eliminar usuario con ID:', userId);
  }
}
