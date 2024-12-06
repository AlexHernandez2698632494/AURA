import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importar RouterModule

@Component({
  selector: 'app-side',
  standalone: true,
  imports: [CommonModule, RouterModule], // Incluir RouterModule aquí
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.css'],
})
export class SideComponent {
  isCollapsed = true; // Inicialmente está colapsada (solo íconos)

  menuItems = [
    { icon: 'home', label: 'Home', route: '/home', submenu: [], isSubmenuOpen: false },
    { 
      icon: 'add', 
      label: 'Registrar', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Administrador', route: '/registrar/administrador' },
        { label: 'Control Administrador', route: '/control/administrador' },
        { label: 'Administradores Eliminados', route: '/eliminados/administradores' },
      ]
    },
    { 
      icon: 'sensors', 
      label: 'Sensores', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Sensor', route: '/registrar/sensor' },
        { label: 'Control Sensores', route: '/control/sensores' },
        { label: 'Sensores Eliminados', route: '/eliminados/sensores' },
      ]
    },
    { 
      icon: 'history', 
      label: 'Ver Historial', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Control Sesiones', route: '/control/sesiones' },
        { label: 'Sesiones Eliminadas', route: '/eliminados/sesiones' },
      ]
    },
    { 
      icon: 'people', 
      label: 'Usuarios', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Control Usuarios', route: '/control/usuarios' },
      ]
    },
    { icon: 'lock', label: 'Cambiar Contraseña', route: '/cambiar-contraseña', submenu: [], isSubmenuOpen: false },
    { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', submenu: [], isSubmenuOpen: false },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: any) {
    if (item.submenu) {
      item.isSubmenuOpen = !item.isSubmenuOpen;
    }
  }
}
