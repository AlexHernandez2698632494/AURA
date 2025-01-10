import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-side',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.css'],
})
export class SideComponent implements OnInit {
  isCollapsed = true; // Inicialmente está colapsada (solo íconos)
  currentRoute: string = ''; // Ruta activa

  // Menú original con las autoridades asociadas a cada elemento
  menuItemsTop = [
    { icon: 'home', label: 'Home', route: '/', submenu: [], isSubmenuOpen: false, authorities: [] },
    {
      icon: 'add',
      label: 'Registrar',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Registrar Administrador', route: '/admin/create', authorities: ['create_users', 'super_administrador', 'administrador'] },
        { label: 'Control Administrador', route: '/admin/index', authorities: ['list_users', 'super_administrador', 'administrador'] },
        { label: 'Administradores Eliminados', route: '/admin/indexE', authorities: ['restore_user', 'super_administrador', 'administrador'] },
      ],
      authorities: ['create_users', 'list_users', 'restore_user', 'super_administrador', 'administrador']
    },
    {
      icon: 'notifications',
      label: 'Alertas',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Registrar Alertas', route: '/alert/create', authorities: ['create_alert', 'super_administrador', 'administrador'] },
        { label: 'Control de Alertas', route: '/alert/index', authorities: ['list_alert', 'super_administrador', 'administrador'] },
        { label: 'Alertas Eliminadas', route: '/alert/indexE', authorities: ['restore_alert', 'super_administrador', 'administrador'] },
      ],
      authorities: ['create_alert', 'list_alert', 'restore_alert', 'super_administrador', 'administrador']
    },
    {
      icon: 'subscriptions',
      label: 'Suscripciones',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Registrar Suscripciones', route: '/suscription/create', authorities: ['create_suscription', 'super_administrador', 'administrador'] },
        { label: 'Control de Suscripciones', route: '/suscription/index', authorities: ['list_suscriptions', 'super_administrador', 'administrador'] },
        { label: 'Suscripciones Eliminadas', route: '/suscription/indexE', authorities: ['restore_suscription', 'super_administrador', 'administrador'] },
      ],
      authorities: ['create_suscription', 'list_suscriptions', 'restore_suscription', 'super_administrador', 'administrador']
    },
    {
      icon: 'apps',
      label: 'Servicios',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Registrar Servicio', route: '/services/create', authorities: ['create_iot_service', 'super_administrador', 'administrador'] },
        { label: 'Control de Servicios', route: '/services/index', authorities: ['list_iot_service', 'super_administrador', 'administrador'] },
        { label: 'Servicios Eliminados', route: '/services/indexE', authorities: ['restore_iot_service', 'super_administrador', 'administrador'] },
      ],
      authorities: ['create_iot_service', 'list_iot_service', 'restore_iot_service', 'super_administrador', 'administrador']
    },
    {
      icon: 'sensors',
      label: 'Sensores',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Registrar Sensor', route: '/sensors/create', authorities: ['create_sensors', 'super_administrador', 'administrador'] },
        { label: 'Control Sensores', route: '/sensors/index', authorities: ['list_sensors', 'super_administrador', 'administrador'] },
        { label: 'Sensores Eliminados', route: '/sensors/indexE', authorities: ['restore_sensors', 'super_administrador', 'administrador'] },
      ],
      authorities: ['create_sensors', 'list_sensors', 'restore_sensors', 'super_administrador', 'administrador']
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
      route: '/users/cambiarContra',
      submenu: [],
      isSubmenuOpen: false,
      authorities: []
    },
  ];

  menuItemsBottom = [
    { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', submenu: [], isSubmenuOpen: false, authorities: [] },
  ];

  authorities: string[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient) { }

  ngOnInit(): void {
    // Detectar ruta activa
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });

    // Cargar las autoridades del usuario desde sessionStorage
    const storedAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    const storedToken = sessionStorage.getItem('token');
    this.authorities = storedAuthorities;

    // Verificar las condiciones
    if (!storedToken || (this.authorities.length === 0 && !storedToken)) {
      // Si no hay token ni authorities, mostrar solo Home, Info y Login en la sección inferior
      this.menuItemsTop = [
        { icon: 'home', label: 'Home', route: '/', submenu: [], isSubmenuOpen: false, authorities: [] },
        { icon: 'help', label: 'About us', route: '/about-us', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
      this.menuItemsBottom = [
        { icon: 'login', label: 'Login', route: '/login', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
    } else if (storedToken && this.authorities.length === 0) {
      // Si hay token pero authorities está vacío, mostrar Home, Cambiar Contraseña y Cerrar Sesión
      this.menuItemsTop = [
        { icon: 'home', label: 'Home', route: '/', submenu: [], isSubmenuOpen: false, authorities: [] },
        { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
      this.menuItemsBottom = [
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
    } else if (storedToken && this.authorities.length > 0) {
      // Si hay token y authorities no está vacío, mostrar menú completo filtrado
      this.filterMenuItems();
    }
  }

  filterMenuItems(): void {
    if (this.authorities.length === 0) {
      this.menuItemsTop = [
        { icon: 'home', label: 'Home', route: '/', submenu: [], isSubmenuOpen: false, authorities: [] },
        { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
      this.menuItemsBottom = [
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', submenu: [], isSubmenuOpen: false, authorities: [] },
      ];
    } else {
      this.menuItemsTop = this.menuItemsTop.filter(item =>
        item.authorities.length === 0 || item.authorities.some(auth => this.authorities.includes(auth))
      );
      this.menuItemsBottom = this.menuItemsBottom.filter(item =>
        item.authorities.length === 0 || item.authorities.some(auth => this.authorities.includes(auth))
      );

      // Filtrar los submenús según las autoridades
      this.menuItemsTop.forEach(item => {
        if (item.submenu) {
          item.submenu = item.submenu.filter(subItem =>
            subItem.authorities.length === 0 || subItem.authorities.some(auth => this.authorities.includes(auth))
          );
        }
      });
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: any) {
    if (item.submenu) {
      if (this.isCollapsed) {
        this.isCollapsed = false;
      }

      this.menuItemsTop.forEach(menuItem => {
        if (menuItem !== item) {
          menuItem.isSubmenuOpen = false;
        }
      });

      item.isSubmenuOpen = !item.isSubmenuOpen;
    }
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  private getBaseUrl(): string {
    const host = window.location.hostname;

    if (host === 'localhost') {
      return 'http://localhost:3000';
    } else if (host === '192.168.1.82') {
      return 'http://192.168.1.82:3000';
    } else if (host === '192.168.1.14') {
      return 'http://192.168.1.14:3000';
    } else {
      // Opción predeterminada
      return 'http://localhost:3000';
    }
  }

  // Método para cerrar sesión
  logout(): void {
    const username = sessionStorage.getItem('username'); // Asegúrate de que 'username' esté almacenado correctamente.

    if (!username) {
      console.error('No se encontró el username en sessionStorage');
      this.router.navigate(['/login']);
      return;
    }

    const baseUrl = this.getBaseUrl(); // Llama al método dentro de la clase
    const logoutEndpoint = `${baseUrl}/logout`;

    // Realiza la solicitud al endpoint correcto
    this.http.post(logoutEndpoint, { username }).subscribe({
      next: () => {
        // Limpia el sessionStorage y redirige al usuario
        sessionStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error durante el logout:', error);
      },
    });
  }

  navigateTo(route: string | undefined): void {
    if (route) {
      this.router.navigate([route]);
    } else {
      console.error('Route is undefined');
    }
  }

}
