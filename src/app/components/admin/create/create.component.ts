import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';

@Component({
  selector: 'app-create',
  imports: [RouterOutlet, SideComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateAdminComponent {
  title = 'Prueba';
}
