import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bottom-tab',
  standalone: true,  // Indica que este componente es autónomo
  imports: [CommonModule],
  templateUrl: './bottom-tab.component.html',
  styleUrl: './bottom-tab.component.css'
})
export class BottomTabComponent implements OnInit{
  authorities: string[] = [];
  menuItems: any[] = [];

  constructor(public router: Router) {}

  ngOnInit(): void {
    const storedAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    const storedToken = sessionStorage.getItem('token');
    this.authorities = storedAuthorities;

    if (!storedToken || (this.authorities.length === 0 && !storedToken)) {
      this.menuItems = [
        { icon: 'home', label: 'Home', route: '/' },
        { icon: 'help', label: 'Help', route: '/help' },
        { icon: 'login', label: 'Login', route: '/login' },
      ];
    } else if (storedToken && this.authorities.length === 0) {
      this.menuItems = [
        { icon: 'home', label: 'Home', route: '/' },
        { icon: 'lock', label: 'Cambiar Contraseña', route: '/users/cambiarContra' },
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', action: this.logout.bind(this) },
      ];
    } else if (storedToken && this.authorities.length > 0) {
      this.menuItems = [
        { icon: 'home', label: 'Home', route: '/' },
        { icon: 'more_horiz', label: 'More', route: '/more' },
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout', action: this.logout.bind(this) },
      ];
    }
  }

  // Método para cerrar sesión
  logout() {
    // Elimina todos los elementos del sessionStorage
    sessionStorage.clear();
    
    // Redirige a la página de inicio de sesión o a la página principal
    this.router.navigate(['/login']);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
