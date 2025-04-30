import { Component, Renderer2, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './services/socket/socket.service'; // <-- Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], 
})
export class AppComponent implements OnInit {
  title = 'IoT';

  constructor(
    private renderer: Renderer2,
    private socketService: SocketService  // <-- Solo se inyecta, no se usa directamente
  ) {}

  ngOnInit() {
    this.applyTheme();
    // No llamamos a métodos del socket aquí; solo se asegura que esté inicializado
  }

  applyTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('Modo oscuro detectado:', prefersDark); // Ver si detecta correctamente

    if (prefersDark) {
      this.renderer.addClass(document.body, 'dark-mode');
      console.log('Modo oscuro activado');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      console.log('Modo claro activado');
    }
  }
}
