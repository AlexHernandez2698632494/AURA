import { Component, OnInit, Output, HostListener, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../services/ApiConfig/api-config.service';
import { AdminService } from '../../services/admin/admin.service';

import { routes } from '../../app.routes';
import { icon } from 'leaflet';

@Component({
  selector: 'app-side',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './side.component.html',
  styleUrls: ['./side.component.css'],
})
export class SideComponent implements OnInit {
  @Output() sideNavToggle: EventEmitter<boolean> = new EventEmitter();
  username: string = '';
  isCollapsed = true;
  screenWidth = 0;
  currentRoute: string = '';

  // Menú original con las autoridades asociadas a cada elemento
  menuItemsTop = [
    { icon: 'home', label: 'Home', route: '/Home', submenu: [], isSubmenuOpen: false, authorities: [] },
    {
      icon: 'space_dashboard',
      label: 'Overview',
      route: '/overview',
      isSubmenuOpen: false,
      submenu: [],
      authorities: ['create_users', 'list_users', 'restore_user', 'super_administrador', 'administrador', 'dev']

    },
    {
      icon: 'hub',
      label: 'IoT',
      route: '/premium/iot/overview',
      isSubmenuOpen: false,
      submenu: [
      ],
      authorities: ['super_administrador']

    },
    {
      icon: 'history',
      label: 'Ver Historial',
      route: '',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Control Sesiones', route: '/sessions/index', authorities: ['super_administrador', 'dev'] },
        { label: 'Sesiones Eliminadas', route: '/sessions/indexE', authorities: ['super_administrador', 'dev'] },
      ],
      authorities: ['super_administrador']
    },
    {
      icon: 'people',
      label: 'Control Usuarios',
      route: '',
      isSubmenuOpen: false,
      submenu: [
        { label: 'Control Usuarios', route: '/users/index', authorities: ['super_administrador', 'dev'] },
      ],
      authorities: ['super_administrador', 'dev']
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

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 1024) {
      this.isCollapsed = true;
    }
  }


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private adminService: AdminService,
    private apiConfig: ApiConfigService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.username = this.adminService.getUsername();
    this.screenWidth = window.innerWidth;

    // 👉 Escucha las redirecciones
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;

        // 🔄 Refrescar manualmente el componente
        this.loadUserAuthoritiesAndMenus();

        // 🔁 Forzar redibujo del componente
        this.cdr.detectChanges();
      }
    });

    this.loadUserAuthoritiesAndMenus();
  }

  loadUserAuthoritiesAndMenus(): void {
  const storedAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
  const storedToken = sessionStorage.getItem('token');
  this.authorities = storedAuthorities;

  if (!storedToken || (this.authorities.length === 0 && !storedToken)) {
    this.menuItemsTop = [
      { icon: 'home', label: 'Home', route: '/Home', submenu: [], isSubmenuOpen: false, authorities: [] },
      { icon: 'help', label: 'About us', route: '/about-us', submenu: [], isSubmenuOpen: false, authorities: [] },
    ];
    this.menuItemsBottom = [
      { icon: 'login', label: 'Login', route: '/login', submenu: [], isSubmenuOpen: false, authorities: [] },
    ];
  } else if (storedToken && this.authorities.length === 0) {
    this.menuItemsTop = [
      { icon: 'home', label: 'Home', route: '/', submenu: [], isSubmenuOpen: false, authorities: [] },
      { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra', submenu: [], isSubmenuOpen: false, authorities: [] },
    ];
    this.menuItemsBottom = [
      { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', submenu: [], isSubmenuOpen: false, authorities: [] },
    ];
  } else if (storedToken && this.authorities.length > 0) {
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

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sideNavToggle.emit(this.isCollapsed)
  }

  toggleSubmenu(item: any) {
    if (item.submenu) {
      if (this.isCollapsed) {
        this.isCollapsed = false;
        this.sideNavToggle.emit(this.isCollapsed);
      }

      this.menuItemsTop.forEach(menuItem => {
        if (menuItem !== item) {
          menuItem.isSubmenuOpen = false;
        }
      });

      item.isSubmenuOpen = !item.isSubmenuOpen;
    }
  }

  isActive(route: string, exact: boolean = false): boolean {
    if (!route) {
      return false;
    }
    return exact ? this.router.url === route : this.router.url.startsWith(route); // Permite marcar como activo si la ruta actual es un subcamino del ítem.
  }

  isSubmenuActive(submenu: any[]): boolean {
    return submenu.some(subItem => this.router.url.startsWith(subItem.route));
  }

  private getApiUrl(): string {
    return this.apiConfig.getApiUrl();
  }

  // Método para cerrar sesión
  logout(): void {
    const username = sessionStorage.getItem('username'); // Asegúrate de que 'username' esté almacenado correctamente.

    if (!username) {
      console.error('No se encontró el username en sessionStorage');
      this.router.navigate(['/login']);
      return;
    }

    const baseUrl = this.getApiUrl(); // Llama al método dentro de la clase
    const logoutEndpoint = `${baseUrl}/oauth2/logout`;

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
      this.router.navigate([route || 'defaultRoute']).then(() => {
        this.currentRoute = this.router.url;
      });
    } else {
      console.error('Route is undefined');
    }
  }


  closeSidenav(): void {
    this.isCollapsed = true;
  }

}
