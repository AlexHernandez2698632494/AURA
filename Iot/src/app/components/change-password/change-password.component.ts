import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideComponent } from '../side/side.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [RouterOutlet, SideComponent, FormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmNewPassword: string = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  constructor(private router: Router) {}

  onSubmit() {
    if (this.newPassword !== this.confirmNewPassword) {
      alert('Las contraseñas no coinciden. Por favor, verifica.');
      return;
    }
    alert('Contraseña cambiada exitosamente');
  }

  onBackClick(): void {
    this.router.navigate(['/admin/index']);
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirmNew') {
      this.showConfirmNewPassword = !this.showConfirmNewPassword;
    }
  }
}