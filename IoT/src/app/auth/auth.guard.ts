import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userAuthorities = JSON.parse(sessionStorage.getItem('authorities') || '[]'); // Obtén las autoridades del usuario desde sessionStorage.
    const routeAuthorities = route.data['authorities'] || []; // Obtén las autoridades requeridas de los datos de la ruta.

    // Verifica si el usuario tiene alguna de las autoridades requeridas.
    const hasPermission = routeAuthorities.some((authority: string) =>
      userAuthorities.includes(authority)
    );

    if (!hasPermission) {
      this.router.navigate(['/403']); // Redirige a una página segura si no tiene permiso.
      return false;
    }

    return true;
  }
}
