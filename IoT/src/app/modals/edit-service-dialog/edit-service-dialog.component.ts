import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable,of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-service-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './edit-service-dialog.component.html',
  styleUrl: './edit-service-dialog.component.css'
})
export class EditServiceDialogComponent {
  sensorTypes$ = of([
      { _id: '1', name: 'Temperatura' },
      { _id: '2', name: 'Humedad' },
      { _id: '3', name: 'Presión' },
    ]);
  
    selectedSensorType!: string; // Usando el operador ! para indicar que será asignado más tarde
  
    sensorForm: FormGroup; // Definición del formulario reactivo
  
    constructor(
      public dialogRef: MatDialogRef<EditServiceDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private fb: FormBuilder
    ) {
      // Inicializar el formulario con los datos recibidos
      this.sensorForm = this.fb.group({
        name: [data.name, Validators.required],
        location: [data.location, Validators.required],
        type: [data.type, Validators.required],
      });
    
      this.selectedSensorType = data.type; // Asignar el valor del tipo de sensor recibido
    }
  
    onSave() {
      const updatedSensorData: any = this.sensorForm.value;
  
      // Si el formulario es válido, entonces procedemos con la actualización
      if (this.sensorForm.valid) {
        console.log('Sensor actualizado:', updatedSensorData);
  
        // Simulación de respuesta exitosa
        Swal.fire({
          title: 'Éxito!',
          text: 'El servicio se ha actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });
        this.dialogRef.close(updatedSensorData);
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Por favor, complete todos los campos correctamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    }
  
    onCancel() {
      this.dialogRef.close();
    }
}
