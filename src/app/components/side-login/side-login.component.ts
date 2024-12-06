import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importar RouterModule

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [CommonModule, RouterModule], // Incluir RouterModule aquí

  templateUrl: './side-login.component.html',
  styleUrl: './side-login.component.css'
})
export class SideLoginComponent {
  isCollapsed = true; // Inicialmente está colapsada (solo íconos)

  // Solo mantenemos el ícono de 'home'
  menuItemsTop = [
    { icon: 'home', label: 'Home', route: '/home', submenu: [], isSubmenuOpen: false }
  ];

  // Cambiamos 'Cerrar sesión' por 'Login'
  menuItemsBottom = [
    { icon: 'login', label: 'Login', route: '/login', submenu: [], isSubmenuOpen: false }
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: any) {
    if (item.submenu) {
      // Si el menú está colapsado, expandirlo
      if (this.isCollapsed) {
        this.isCollapsed = false;
      }

      // Cerrar todos los submenús de la sección superior, excepto el actual
      this.menuItemsTop.forEach(menuItem => {
        if (menuItem !== item) {
          menuItem.isSubmenuOpen = false;
        }
      });

      // Alternar el submenú del elemento actual
      item.isSubmenuOpen = !item.isSubmenuOpen;
    }
  }
}