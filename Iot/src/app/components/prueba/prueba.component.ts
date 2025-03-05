import { Component } from '@angular/core';
import { SideComponent } from '../side/side.component';

@Component({
  selector: 'app-prueba',
  imports: [SideComponent],
  templateUrl: './prueba.component.html',
  styleUrl: './prueba.component.css'
})
export class PruebaComponent {
  title = 'Prueba';
}
