import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from './components/side/side.component'; // Importa el SideComponent

@Component({
  selector: 'app-root',
  standalone: true, // El AppComponent también es standalone
  imports: [RouterOutlet, SideComponent], // Agrega SideComponent a los imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'], // Corrige el nombre de la propiedad
})
export class AppComponent {
  title = 'IoT';
}
