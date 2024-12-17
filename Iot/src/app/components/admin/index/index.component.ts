import { Component, OnInit } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';  // Importar SweetAlert2

@Component({
  selector: 'app-index-admin',
  standalone: true,
  imports: [RouterOutlet, SideComponent, FormsModule, CommonModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexAdminComponent implements OnInit {
  users: any[] = [];
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  Math = Math;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  // Carga los usuarios desde el servicio
  loadUsers() {
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
    console.log('Editar usuario:', user);
  }

  deleteUser(userId: string) {
    console.log('Eliminar usuario con ID:', userId);
  }
}
