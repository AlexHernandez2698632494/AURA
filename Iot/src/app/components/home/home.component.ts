import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideLoginComponent } from '../side-login/side-login.component';

@Component({
  selector: 'app-root',
  standalone: true, // El AppComponent también es standalone
  imports: [RouterOutlet, SideLoginComponent], // Agrega SideComponent a los imports
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // Corrige el nombre de la propiedad
})
export class HomeComponent {
  title = 'Home';
}
