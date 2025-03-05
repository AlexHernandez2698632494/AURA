import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SideComponent } from '../side/side.component';
import { BottomTabComponent } from '../bottom-tab/bottom-tab.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdminService } from '../../services/admin/admin.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
     SideComponent,
      BottomTabComponent, 
      FormsModule, 
      CommonModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true
  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  currentPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmNewPassword = false;

  constructor(private router: Router, private adminService: AdminService) {}

  onSubmit() {
    // Validación de campos vacíos
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Validación de contraseñas coincidentes
    if (this.newPassword !== this.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden. Por favor, verifica.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Validación de longitud mínima
    if (this.newPassword.length < 5) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La nueva contraseña debe tener al menos 8 caracteres.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // Enviar datos al backend
    const requestData = {
      contrasenaActual: this.currentPassword,
      nuevaContrasena: this.newPassword,
    };

    this.adminService.changePassword(requestData).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response.message,
          confirmButtonText: 'Aceptar',
        }).then(() => {
          this.router.navigate(['/admin/index']);
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message || 'Ocurrió un error al cambiar la contraseña.',
          confirmButtonText: 'Aceptar',
        });
      },
    });
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
