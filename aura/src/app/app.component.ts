import { Component, Renderer2, OnInit, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'IoT';
  private inactivityTimeout: any;
  private readonly INACTIVITY_LIMIT = 5 * 1000; // 20 minutos en milisegundos

  constructor(
    private renderer: Renderer2,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.applyTheme();
    this.setupInactivityListener();
    this.setupVisibilityListener();
  }

  applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  setupInactivityListener() {
    const resetTimer = () => {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = setTimeout(() => this.logout(), this.INACTIVITY_LIMIT);
    };

    // Escucha varios eventos que indican actividad del usuario
    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(event =>
      this.document.addEventListener(event, resetTimer)
    );

    resetTimer(); // Iniciar el temporizador desde el inicio
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logout();
      }
    });
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
