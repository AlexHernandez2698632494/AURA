import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-create',
  imports: [MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    RouterOutlet,
    SideComponent,
    MatButtonModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css'
})
export class CreateAlertComponent {
  AlertForm: FormGroup;
  constructor(    private router: Router,
    private fb: FormBuilder,
  ){
    this.AlertForm = this.fb.group({
      nombre: ['', [Validators.required]],
      color: ['', [Validators.required]],
      rangoFinal: ['', [Validators.required]],
      rangoInicial: ['', [Validators.required]],
      nivel: ['', [Validators.required]],
      variable: ['', [Validators.required]]
    });
  }
  onBackClick(): void {
    // Regresar a la vista de administrador
    this.router.navigate(['/admin/index']);
  }

}
