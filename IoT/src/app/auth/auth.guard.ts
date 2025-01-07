import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = sessionStorage.getItem('token'); // Obtener el token de sessionStorage

    if (token && !this.isTokenExpired(token)) {
      return true; // Permitir acceso si el token es válido
    } else {
      sessionStorage.removeItem('token'); // Limpiar token inválido o inexistente
      return this.router.parseUrl('/login'); // Redirigir al inicio de sesión
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decodificar payload del JWT
      const expiration = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() > expiration; // Comparar con la fecha actual
    } catch (error) {
      return true; // Si el token no es decodificable, se considera inválido
    }
  }
}
