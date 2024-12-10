import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../side/side.component';

@Component({
  selector: 'app-prueba',
  imports: [RouterOutlet, SideComponent],
  templateUrl: './prueba.component.html',
  styleUrl: './prueba.component.css'
})
export class PruebaComponent {
  title = 'Prueba';
}
