import { Component, Renderer2, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], 
})
export class AppComponent {
  title = 'IoT';
  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.applyTheme();
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
