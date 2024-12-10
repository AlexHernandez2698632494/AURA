import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [RouterOutlet, SideComponent, FormsModule,CommonModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexUsersComponent {
  users = [
    { type: 'Administrador', username: 'gerardo.1992', name: 'Gerardo Antonio Esquivel Ponce' },
    { type: 'Administrador', username: 'ebarego.81', name: 'Carlos Enrique Barrera Gómez' },
  ];
  Math = Math;
  searchTerm: string = ''; // Valor del input de búsqueda
  recordsToShow: number = 10; // Número de registros a mostrar por página
  currentPage: number = 1; // Página actual

  // Filtra usuarios según el término de búsqueda
  filteredUsers() {
    const filtered = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.type.toLowerCase().includes(this.searchTerm.toLowerCase())
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
}