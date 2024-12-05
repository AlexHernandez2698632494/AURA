import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.css'],
})
export class SideComponent {
  isCollapsed = true; // Inicialmente está colapsada (solo íconos)

  menuItems = [
    { icon: 'home', label: 'Home' },
    { icon: 'add', label: 'Registrar' },
    { icon: 'sensors', label: 'Sensores' },
    { icon: 'history', label: 'Ver Historial' },
    { icon: 'people', label: 'Usuarios' },
    { icon: 'lock', label: 'Cambiar Contraseña' },
    { icon: 'logout', label: 'Cerrar Sesión' },
  ];

  // Alterna entre colapsar y expandir la barra lateral
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
