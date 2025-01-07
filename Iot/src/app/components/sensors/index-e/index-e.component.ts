import { Component, OnInit } from '@angular/core';
import { RouterOutlet,Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';  // Importar SweetAlert2
import { EditSensorDialogComponent } from '../../../modals/edit-sensor-dialog/edit-sensor-dialog.component';
import { ViewSensorDialogComponent } from '../../../modals/view-sensor-dialog/view-sensor-dialog.component'; 

import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-index-e-sensors',
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
  ],  templateUrl: './index-e.component.html',
  styleUrl: './index-e.component.css'
})
export class IndexESensorsComponent {
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

  viewSensor(user: any) {
    const dialogRef = this.dialog.open(ViewSensorDialogComponent, {
      width: '400px',
      data: { ...user }, // Pasa una copia del usuario al modal
    });
  } 

  editSensor(user: any) {
    const dialogRef = this.dialog.open(EditSensorDialogComponent, {
      width: '400px',
      data: { ...user }, // Pasa una copia del usuario al modal
    });
  }  
  
deleteUser(user: any) {
    
  }

}
