import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true, // El AppComponent también es standalone
  imports: [RouterOutlet, NavComponent], // Agrega SideComponent a los imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // Corrige el nombre de la propiedad
})
export class AppComponent {
  title = 'IoT';
}
