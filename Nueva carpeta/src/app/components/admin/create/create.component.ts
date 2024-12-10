import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create',
  imports: [RouterOutlet, SideComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateAdminComponent {
  constructor(private router: Router) {}

  onBackClick(): void {
    this.router.navigate(['/admin/index']); // Reemplaza '/ruta-destino' con la ruta deseada
  }}
