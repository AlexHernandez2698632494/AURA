import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';

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
    SideComponent,
    BottomTabComponent,
    MatButtonModule,
    RouterOutlet
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateAdminComponent implements OnInit {
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
    // Obtener todas las autoridades desde la base de datos
    this.adminService.getAuthorities().subscribe(
      (authorities) => {
        // Obtener el array de autoridades del usuario desde sessionStorage
        const authoritiesFromSession = sessionStorage.getItem('authorities');
        const authoritiesArray = authoritiesFromSession ? JSON.parse(authoritiesFromSession) : [];
  
        // Filtrar las autoridades disponibles según las reglas de sessionStorage
        if (authoritiesArray.includes('super_administrador') || authoritiesArray.includes('dev')) {
          // Si tiene autoridad de super_administrador o dev, mostrar todas las autoridades
          this.availableAuthorities = authorities;
        } else if (authoritiesArray.includes('administrador')) {
          // Si tiene autoridad de administrador, mostrar desde la tercera autoridad en adelante (índice 2)
          this.availableAuthorities = authorities.slice(2); // Desde la tercera en adelante
        } else if (authoritiesArray.includes('create_users')) {
          // Si tiene autoridad de create_user, mostrar desde la cuarta autoridad en adelante (índice 3)
          this.availableAuthorities = authorities.slice(3); // Desde la cuarta en adelante
        } else {
          // Si no tiene ninguna de las autoridades específicas, mostrar todas las autoridades
          this.availableAuthorities = authorities;
        }
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
 // Obtener el usuario autenticado desde sessionStorage
 const authenticatedUser = sessionStorage.getItem('username');

      const authoritiesWithIds = this.selectedAuthorities.map(authorityName => {
        const authority = this.availableAuthorities.find(a => a.name === authorityName);
        return authority ? { id: authority._id } : null;
      }).filter(authority => authority);

      const adminPayload = {
        nombre: adminData.nombre,
        usuario: adminData.usuario,
        correo: adminData.correo,
        authorities: authoritiesWithIds, // Cambiar roles a authorities
        usuarioHistory: authenticatedUser 
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