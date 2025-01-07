import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IdleService {
  private idleTimeout = 5 * 60 * 1000; // 5 minutos en milisegundos
  private activityEvents: string[] = ['mousemove', 'keydown', 'click', 'scroll'];
  private eventSubscriptions: Subscription[] = [];
  private idleTimerSubscription?: Subscription;

  constructor(private router: Router) {}

  startWatching(): void {
    this.resetIdleTimer();

    this.activityEvents.forEach((event) => {
      const subscription = fromEvent(document, event).subscribe(() => this.resetIdleTimer());
      this.eventSubscriptions.push(subscription);
    });
  }

  stopWatching(): void {
    this.eventSubscriptions.forEach((sub) => sub.unsubscribe());
    this.idleTimerSubscription?.unsubscribe();
  }

  private resetIdleTimer(): void {
    this.idleTimerSubscription?.unsubscribe();

    this.idleTimerSubscription = timer(this.idleTimeout).subscribe(() => this.logout());
  }

  private logout(): void {
    sessionStorage.clear(); // Limpia el almacenamiento local
    this.stopWatching(); // Detiene la observación de eventos
    this.router.navigate(['/login']); // Redirige al inicio de sesión
  }
}
