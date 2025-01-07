import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from '../../nav/nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';  // Importar SweetAlert2

@Component({
  selector: 'app-index-e',
  imports: [RouterOutlet,
    NavComponent,
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
export class IndexEAlertComponent {
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  Math = Math;

  constructor(private router: Router) { }

  ngOnInit() {
    this.loadUsers();
  }

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
  }

  
}
