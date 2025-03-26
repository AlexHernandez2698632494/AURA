import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../../../side/side.component';
import { BottomTabComponent } from '../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../services/paymentUser/payment-user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent, MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class BuildingBranchCreateComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  subscriptionsCount: number = 0;
  subscriptionsList: { name: string; isExpired: boolean }[] = [];
  usersCount: number = 0;
  BranchForm: FormGroup;
  imagePrincipalName: string = '';
  buildingName: string = '';  // Para almacenar el nombre del edificio
  nivel: string = '';          // Para almacenar el nivel

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute 
  ) {
    this.BranchForm = this.fb.group({
      nombre: ['', [Validators.required]],
      imagenPrincipal: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Capturar el 'buildingName' y 'nivel' de la URL
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || ''; // Obtiene 'buildingName' de la URL
      this.nivel = params.get('id') || '';  // Obtiene 'nivel' de la URL
    });
  }

  registerBranch(): void {
    if (this.BranchForm.invalid) {
      return; // Si el formulario es inválido, no hacemos nada
    }

    const nombre = this.BranchForm.get('nombre')?.value;
    const formData = new FormData();
console.log("nivel",this.nivel)
console.log("nombe",this.buildingName)
    // Agregar los datos del formulario y los parámetros de la URL al FormData
    formData.append('nombre_salon', nombre);
    formData.append('nivel', this.nivel);
    formData.append('buildingName', this.buildingName);

    // Obtener el input de la imagen principal
    const mainImageInput: HTMLInputElement | null = document.getElementById('imagenFile') as HTMLInputElement;
    if (mainImageInput && mainImageInput.files && mainImageInput.files.length > 0) {
      formData.append('imagen_salon', mainImageInput.files[0]); // Agregar el archivo de la imagen principal
    } else {
      console.error('No se ha seleccionado una imagen principal.');
      return; // Salir si no hay imagen principal
    }

    // Llamar al servicio para registrar el salón
    this.paymentUserService.createBranch(formData).subscribe(
      (response) => {
        console.log('Salón registrado exitosamente', response);
        // Redirigir o mostrar un mensaje de éxito
        Swal.fire('Éxito', 'El salón ha sido registrado correctamente.', 'success');
      },
      (error) => {
        console.error('Error al registrar el salón', error);
        // Mostrar mensaje de error
        Swal.fire('Error', 'Hubo un problema al registrar el salón.', 'error');
      }
    );
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  // Método para activar el input file al hacer clic en el botón
  triggerFileInput() {
    const fileInput: HTMLElement = document.getElementById('imagenFile') as HTMLElement;
    fileInput.click();  // Esto hace que se abra el diálogo de selección de archivo
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagePrincipalName = file.name;
      this.BranchForm.get('imagenPrincipal')?.setValue(this.imagePrincipalName);
    }
  }
}
