import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NgxColorsModule } from 'ngx-colors';

@Component({
  selector: 'app-create',
  standalone:true,
  imports: [
    MatChipsModule,
    NgxColorsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    SideComponent,
    BottomTabComponent,
    MatButtonModule
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateAlertComponent {
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
  AlertForm: FormGroup;
  color: string = '';

  constructor(private router: Router, private fb: FormBuilder) {
    this.AlertForm = this.fb.group({
      nombre: ['', [Validators.required]],
      color: ['', [Validators.required, this.hexColorValidator]],
      rangoFinal: ['', [Validators.required]],
      rangoInicial: ['', [Validators.required]],
      nivel: ['', [Validators.required]],
      variable: ['', [Validators.required]]
    });
  }

  onBackClick(): void {
    this.router.navigate(['/admin/index']);
  }

  hexColorValidator(control: any) {
    const hexRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    return hexRegex.test(control.value) ? null : { invalidHexColor: true };
  }

  onColorChange(newColor: string): void {
    this.AlertForm.patchValue({ color: newColor });
  }

  onSubmit(): void {
    if (this.AlertForm.valid) {
      console.log('Formulario válido:', this.AlertForm.value);
      Swal.fire('Éxito', 'La alerta se ha registrado correctamente', 'success');
    } else {
      Swal.fire('Error', 'Por favor, completa todos los campos requeridos.', 'error');
    }
  }
}
