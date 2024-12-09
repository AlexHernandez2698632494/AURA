import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';

@Component({
  selector: 'app-index',
  imports: [RouterOutlet, SideComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexAdminComponent {
  title = 'Prueba';
}
