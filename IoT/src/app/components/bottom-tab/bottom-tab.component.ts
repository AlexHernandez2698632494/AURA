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
    const storedAuthorities = JSON.parse(localStorage.getItem('authorities') || '[]');
    const storedToken = localStorage.getItem('token');
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
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout' },
      ];
    } else if (storedToken && this.authorities.length > 0) {
      this.menuItems = [
        { icon: 'home', label: 'Home', route: '/' },
        { icon: 'more_horiz', label: 'More', route: '/more' },
        { icon: 'logout', label: 'Cerrar Sesión', route: '/logout' },
      ];
    }
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}