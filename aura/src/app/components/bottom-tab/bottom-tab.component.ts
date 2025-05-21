import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../services/ApiConfig/api-config.service';

@Component({
  selector: 'app-bottom-tab',
  standalone: true,  // Indica que este componente es autónomo
  imports: [CommonModule],
  templateUrl: './bottom-tab.component.html',
  styleUrl: './bottom-tab.component.css'
})

export class BottomTabComponent implements OnInit {
  authorities: string[] = [];
  menuItems: any[] = [];

  constructor(public router: Router, private http: HttpClient, private apiConfig: ApiConfigService) { }

  ngOnInit(): void {
    const storedAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    const storedToken = sessionStorage.getItem('token');
    this.authorities = storedAuthorities;

    if (!storedToken || (this.authorities.length === 0 && !storedToken)) {
      this.menuItems = [
        { icon: 'home', label: 'Home', route: '/Home' },
        { icon: 'help', label: 'Help', route: '/about-us' },
        { icon: 'login', label: 'Login', route: '/login' },
      ];
    } else if (storedToken && this.authorities.length === 0) {
      this.menuItems = [
        { icon: 'home', label: 'Home', route: '/Home' },
        { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra' },
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', action: this.logout.bind(this) },
      ];
    } else if (storedToken && this.authorities.length > 0) {
      // Aquí verificamos si el usuario tiene 'super_usuario' en sus authorities
      if (this.authorities.includes('super_usuario')) {
        this.menuItems = [
          { icon: 'home', label: 'Home', route: '/Home' },
          { icon: 'subscriptions', label: 'Subscription', route: '/overview' },
          { icon: 'devices', label: 'IoT', route: '/premium/iot/overview' },
          { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra' },
          { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', action: this.logout.bind(this) },
        ];
      } else {
        this.menuItems = [
          { icon: 'home', label: 'Home', route: '/Home' },
          { icon: 'more_horiz', label: 'More', route: '/more' },
          { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', action: this.logout.bind(this) },
        ];
      }
    }
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

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
