import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-more',
  imports: [CommonModule, RouterModule, FormsModule, NavComponent],
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.css']
})
export class MoreComponent implements OnInit {

  // Menú con autoridades y rutas alineadas con las que tienes en el componente "Side"
  menuItemsTop = [
    { 
      icon: 'add', 
      label: 'Registrar', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Administrador', route: '/admin/create', authorities: ['create_users','super_administrador', 'administrador'] },
        { label: 'Control Administrador', route: '/admin/index', authorities: ['list_users','super_administrador', 'administrador'] },
        { label: 'Administradores Eliminados', route: '/admin/indexE', authorities: ['delete_user','super_administrador', 'administrador'] },
      ],
      authorities: ['create_users', 'list_users', 'delete_user','super_administrador', 'administrador']
    },
    { 
      icon: 'notifications', 
      label: 'Alertas', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Alertas', route: '/alert/create', authorities: ['create_alert','super_administrador', 'administrador'] },
        { label: 'Control de Alertas', route: '/alert/index', authorities: ['list_alert','super_administrador', 'administrador'] },
        { label: 'Alertas Eliminadas', route: '/alert/indexE', authorities: ['delete_alert','super_administrador', 'administrador'] },
      ],
      authorities: ['create_alert', 'list_alert', 'delete_alert','super_administrador', 'administrador']
    },
    { 
      icon: 'subscriptions', 
      label: 'Suscripciones', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Suscripciones', route: '/suscription/create', authorities: ['create_suscription','super_administrador', 'administrador'] },
        { label: 'Control de Suscripciones', route: '/suscription/index', authorities: ['list_suscriptions','super_administrador', 'administrador'] },
        { label: 'Suscripciones Eliminadas', route: '/suscription/indexE', authorities: ['delete_suscription','super_administrador', 'administrador'] },
      ],
      authorities: ['create_suscription', 'list_suscriptions', 'delete_suscription','super_administrador', 'administrador']
    },
    { 
      icon: 'apps', 
      label: 'Servicios', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Servicio', route: '/services/create', authorities: ['create_iot_service','super_administrador', 'administrador'] },
        { label: 'Control de Servicios', route: '/services/index', authorities: ['list_iot_service','super_administrador', 'administrador'] },
        { label: 'Servicios Eliminados', route: '/services/indexE', authorities: ['delete_iot_service','super_administrador', 'administrador'] },
      ],
      authorities: ['create_iot_service', 'list_iot_service', 'delete_iot_service','super_administrador', 'administrador']
    },
    { 
      icon: 'sensors', 
      label: 'Sensores', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Registrar Sensor', route: '/sensors/create', authorities: ['create_sensors','super_administrador', 'administrador'] },
        { label: 'Control Sensores', route: '/sensors/index', authorities: ['list_sensors','super_administrador', 'administrador'] },
        { label: 'Sensores Eliminados', route: '/sensors/indexE', authorities: ['delete_sensors','super_administrador', 'administrador'] },
      ],
      authorities: ['create_sensors', 'list_sensors', 'delete_sensors','super_administrador', 'administrador']
    },
    { 
      icon: 'history', 
      label: 'Ver Historial', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Control Sesiones', route: '/sessions/index', authorities: ['super_administrador'] },
        { label: 'Sesiones Eliminadas', route: '/sessions/indexE', authorities: ['super_administrador'] },
      ],
      authorities: ['super_administrador']
    },
    { 
      icon: 'people', 
      label: 'Control Usuarios', 
      isSubmenuOpen: false, 
      submenu: [
        { label: 'Control Usuarios', route: '/users/index', authorities: ['super_administrador'] },
      ],
      authorities: ['super_administrador']
    },
    { 
      icon: 'lock', 
      label: 'Cambiar Contraseña', 
      route: '/users/cambiarContra',  // Asegúrate que la ruta esté correctamente definida
      submenu: [], 
      isSubmenuOpen: false, 
      authorities: [] 
    }
  ];

  authorities: string[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirige a '/home' si el ancho de la pantalla es mayor a 1025px
    if (window.innerWidth > 1025) {
      this.router.navigate(['/home']);
      return; // Detiene la ejecución del resto del código
    }

    const storedAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    const storedToken = sessionStorage.getItem('token');
    this.authorities = storedAuthorities;

    if (!storedToken || (this.authorities.length === 0 && !storedToken)) {
      this.menuItemsTop = [
        { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
    } else {
      this.filterMenuItems();
    }
  }

  toggleSubmenu(item: any): void {
    // Si el submenú de otro ítem está abierto, lo cerramos
    this.menuItemsTop.forEach(menuItem => {
      if (menuItem !== item) {
        menuItem.isSubmenuOpen = false;
      }
    });

    // Ahora alternamos el submenú del ítem seleccionado
    item.isSubmenuOpen = !item.isSubmenuOpen;
  }

  navigateTo(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
    } else {
      console.error('Route is undefined');
    }
  }

  // Nueva función para manejar los clics en los elementos de menú
  onMenuItemClick(item: any): void {
    if (item.submenu && item.submenu.length > 0) {
      // Si el ítem tiene submenú, se alterna su apertura
      this.toggleSubmenu(item);
    } else if (item.route) {
      // Si el ítem no tiene submenú, se navega directamente a la ruta
      this.navigateTo(item.route);
    }
  }

  filterMenuItems(): void {
    if (this.authorities.length === 0) {
      this.menuItemsTop = [
        { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
    } else {
      this.menuItemsTop = this.menuItemsTop.filter(item =>
        item.authorities.length === 0 || item.authorities.some(auth => this.authorities.includes(auth))
      );

      this.menuItemsTop.forEach(item => {
        if (item.submenu) {
          item.submenu = item.submenu.filter(subItem =>
            subItem.authorities.length === 0 || subItem.authorities.some(auth => this.authorities.includes(auth))
          );
        }
      });
    }
  }

  logout(): void {
    sessionStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
