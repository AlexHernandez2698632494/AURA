import { Component, OnInit, Output, HostListener, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../../services/ApiConfig/api-config.service';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
//import { AdminService } from '../../../services/admin/admin.service';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-premium-side',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './side.component.html',
  styleUrl: './side.component.css'
})
export class PremiumSideComponent implements OnInit{
  @Output() sideNavToggle: EventEmitter<boolean> = new EventEmitter();
  username: string = '';
  isCollapsed = true;
  screenWidth = 0;
  currentRoute: string = '';

  menuItemsTop = [
    { icon: 'home', label: 'Home', route: '/Home'}, 
    { icon: 'space_dashboard', label: 'Overview', route: '/premium/overview'}, 
    {icon:'switch_account', label:'Usuarios',route:'/premium/users'}, 
    { icon: 'subscriptions', label: 'Suscripción', route: '/subscriptions'}, 
    { icon: 'hub', label: 'IoT', route: '/premium/iot/overview'}, 
    { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra'}
  ];

  menuItemsBottom = [
    { icon: 'logout', label: 'Cerrar Sesión', route: '/logout'},
  ];


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 1024) {
      this.isCollapsed = true;
    }
  }

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private http: HttpClient, private paymetUserService: PaymentUserService, private apiConfig: ApiConfigService) { }

    ngOnInit(): void {
      this.username = this.paymetUserService.getUsername();
      this.screenWidth = window.innerWidth;
  
      this.router.events.subscribe(() => {
        this.currentRoute = this.router.url;
      });

      const storedAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
      const storedToken = sessionStorage.getItem('token');
    }

    toggleSidebar(): void {
      this.isCollapsed = !this.isCollapsed;
      this.sideNavToggle.emit(this.isCollapsed)
    }

    toggleSubmenu(item: any) {
      if (item.submenu) {
        if (this.isCollapsed) {
          this.isCollapsed = false;
        }
        item.isSubmenuOpen = !item.isSubmenuOpen;
      }
    }
  
    isActive(route: string): boolean {
  if (!route) {
    return false;
  }
  const current = this.router.url.split('?')[0].split('#')[0];

  return current === route || current.startsWith(route + '/');
}
  
    isSubmenuActive(submenu: any[]): boolean {
      return submenu.some(subItem => this.router.url.startsWith(subItem.route));
    }

    private getApiUrl():string{
      return this.apiConfig.getApiUrl();
    }
 
    logout(): void {
      const username = sessionStorage.getItem('username'); 
  
      if (!username) {
        console.error('No se encontró el username en sessionStorage');
        this.router.navigate(['/login']);
        return;
      }
  
      const baseUrl = this.getApiUrl(); 
      const logoutEndpoint = `${baseUrl}/oauth2/logout`;

      this.http.post(logoutEndpoint, { username }).subscribe({
        next: () => {
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
