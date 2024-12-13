import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common'; // Para directivas básicas como *ngIf y *ngFor

@Component({
  selector: 'app-create',
  imports: [RouterOutlet, SideComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateAdminComponent {
  adminForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    // Inicialización del formulario con las validaciones necesarias
    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required]],
      usuario: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Método para volver atrás
  onBackClick(): void {
    this.router.navigate(['/admin/index']);
  }

  // Método para registrar el administrador
  registerAdmin(): void {
    if (this.adminForm.valid) {
      // Pasamos los datos del formulario al servicio
      this.adminService.registerAdmin(this.adminForm.value).subscribe(
        (response) => {
          console.log('Administrador registrado:', response);
          this.router.navigate(['/admin/index']); // Redirige a la lista de administradores
        },
        (error) => {
          console.error('Error al registrar administrador:', error);
        }
      );
    }
  }
}
