import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import {  Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreatePaymetUserComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true;

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  premiumForm: FormGroup;

  // Variables para manejar las opciones de duración
  durationOptions: number[] = [];
  isDurationDisabled: boolean = true;

  constructor(
    private router: Router,           
    private fb: FormBuilder,
    private premiumService: PaymentUserService
  ) {
    this.premiumForm = this.fb.group({
      name: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      planType: ['', [Validators.required]],
      duration: [{ value: '', disabled: true }, [Validators.required]]
    });
  }

  // Método que se ejecuta cuando cambia el tipo de plan
  onPlanTypeChange(event: any) {
    const planType = event.value;

    // Restablecer las opciones de duración y habilitar o deshabilitar el campo
    if (planType === 'free') {
      this.durationOptions = [1];
      this.isDurationDisabled = true;
    } else if (planType === 'month') {
      this.durationOptions = Array.from({ length: 11 }, (_, i) => i + 1);
      this.isDurationDisabled = false;
    } else if (planType === 'year') {
      this.durationOptions = Array.from({ length: 5 }, (_, i) => i + 1);
      this.isDurationDisabled = false;
    } else  if (planType === 'unlimited') {
      this.durationOptions = [0];
      this.isDurationDisabled = true;
    } 

    // Restablecer la duración a un valor vacío
    this.premiumForm.get('duration')?.setValue('');
  }

  // Método para enviar el formulario y hacer la solicitud
  onSubmit() {
    if (this.premiumForm.valid) {
      // Obtenemos los valores del formulario
      const formValues = this.premiumForm.value;

      // Recuperamos los datos del sessionStorage
      const usuarioHistory = sessionStorage.getItem('usuario');
      const token = sessionStorage.getItem('token');

      // Creamos el objeto para enviar al backend
      const authorityData = {
        type: formValues.name, // Puedes ajustar esto según cómo se espera el valor 'type'
        email: formValues.correo,
        planType: formValues.planType === 'mes' ? 'month' : formValues.planType === 'año' ? 'year' : 'free',
        duration: formValues.duration,
        usuarioHistory: usuarioHistory || '', // Asegúrate de tener algo en sessionStorage
      };

      // Llamamos al servicio para registrar al usuario
      this.premiumService.createAuthorityKey(authorityData).subscribe(
        (response) => {
          Swal.fire('¡Exito!', 'El usuario ha sido registrado correctamente', 'success');
          // Redirigir o hacer lo que sea necesario después de la respuesta
        },
        (error) => {
          Swal.fire('Error', 'Hubo un problema al registrar el usuario', 'error');
        }
      );
    } else {
      Swal.fire('Error', 'Por favor complete todos los campos correctamente.', 'warning');
    }
  }
}
