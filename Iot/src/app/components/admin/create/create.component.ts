import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    RouterOutlet,
    SideComponent,
    MatButtonModule
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateAdminComponent implements OnInit {
  adminForm: FormGroup;
  availableAuthorities: any[] = [];  // Lista de autoridades disponibles
  selectedAuthorities: any[] = [];   // Autoridades seleccionadas
  readonly separatorKeysCodes: number[] = [ENTER, COMMA]; // Para separar autoridades

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.adminForm = this.fb.group({
      nombre: ['', [Validators.required]],
      usuario: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      authorities: [[], [Validators.required]] // Cambiar roles a authorities
    });
  }

  ngOnInit(): void {
    this.adminService.getAuthorities().subscribe(
      (authorities) => {
        this.availableAuthorities = authorities; // Actualizar disponibles
      },
      (error) => {
        console.error('Error al obtener autoridades', error);
        Swal.fire('Error', 'No se pudieron cargar las autoridades', 'error');
      }
    );
  }

  onAuthoritySelection(event: any): void {
    const value = event.value;
    this.selectedAuthorities = value;
    this.adminForm.patchValue({ authorities: this.selectedAuthorities });
  }

  removeAuthority(authority: string): void {
    this.selectedAuthorities = this.selectedAuthorities.filter((a) => a !== authority);
    this.adminForm.patchValue({ authorities: this.selectedAuthorities });
  }

  registerAdmin(): void {
    if (this.adminForm.valid) {
      const adminData = this.adminForm.value;

      const authoritiesWithIds = this.selectedAuthorities.map(authorityName => {
        const authority = this.availableAuthorities.find(a => a.name === authorityName);
        return authority ? { id: authority._id } : null;
      }).filter(authority => authority);

      const adminPayload = {
        nombre: adminData.nombre,
        usuario: adminData.usuario,
        correo: adminData.correo,
        authorities: authoritiesWithIds // Cambiar roles a authorities
      };

      this.adminService.registerAdmin(adminPayload).subscribe(
        (response) => {
          Swal.fire('Éxito', 'Administrador registrado correctamente', 'success');
          this.router.navigate(['/admin/index']);
        },
        (error) => {
          console.error('Error al registrar administrador', error);
          Swal.fire('Error', 'No se pudo registrar al administrador', 'error');
        }
      );
    } else {
      Swal.fire('Advertencia', 'Por favor, complete todos los campos correctamente', 'warning');
    }
  }

  onBackClick(): void {
    // Regresar a la vista de administrador
    this.router.navigate(['/admin/index']);
  }
}