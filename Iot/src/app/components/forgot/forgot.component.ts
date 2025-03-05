import { Component, signal } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { AdminService } from '../../services/admin/admin.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // Importar FormsModule

@Component({
  selector: 'app-forgot',
  imports: [ NavComponent,FormsModule],
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent {
  title = 'Forgot';
  username: string = '';

  constructor(private adminService: AdminService, private router: Router) {}

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.username.trim()) {
      alert('Por favor, ingrese un nombre de usuario.');
      return;
    }

    this.adminService.restorePassword(this.username).subscribe({
      next: (response) => {
        alert('Se ha enviado un correo con la nueva contraseña.');
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (err) => {
        console.error(err);
        alert('Error al restablecer la contraseña. Verifique el nombre de usuario e intente nuevamente.');
      }
    });
  }
}
