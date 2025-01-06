import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-more',
  templateUrl: './more.component.html',
  styleUrls: ['./more.component.css'],
})
export class MoreComponent implements OnInit {
  isAuthenticated: boolean = false; // Variable que indica si el usuario está autenticado

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    const storedToken = localStorage.getItem('token');
    const storedAuthorities = JSON.parse(localStorage.getItem('authorities') || '[]');

    // Si el token o las autoridades existen, el usuario está autenticado
    if (storedToken && storedAuthorities.length > 0) {
      this.isAuthenticated = true;
    }
  }

  // Función para navegar a otras rutas
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
