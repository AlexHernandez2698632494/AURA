import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from '../../nav/nav.component';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin/admin.service';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    RouterOutlet,
    NavComponent,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexUsersComponent implements OnInit {
  users: any[] = [];
  authorities: any[] = [];
  Math = Math;
  searchTerm: string = '';
  recordsToShow: number = 10;
  currentPage: number = 1;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const token = sessionStorage.getItem('token'); // Recuperamos el token desde sessionStorage

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No se encuentra el token',
        text: 'Por favor, inicie sesión nuevamente.',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return; // No continuar si no hay token
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

    this.adminService.getAuthorities().subscribe({
      next: (data) => {
        this.authorities = data;
        console.log('Autoridades cargadas:', this.authorities);
      },
      error: (err) => {
        console.error('Error al cargar las autoridades:', err);
      }
    });
  }

  // Filtra usuarios según el término de búsqueda
  filteredUsers() {
    const filtereduser = this.users.filter(user =>
      user.usuario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtereduser.slice(start, end);
  }

  filteredAuthorities() {
    const filteredAuthorities = this.authorities.filter(authority =>
      authority.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filteredAuthorities.slice(start, end);
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
}
