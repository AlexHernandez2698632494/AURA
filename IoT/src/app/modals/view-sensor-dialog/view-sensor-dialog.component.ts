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
  selector: 'app-view-sensor-dialog',
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
  templateUrl: './view-sensor-dialog.component.html',
  styleUrl: './view-sensor-dialog.component.css'
})
export class ViewSensorDialogComponent {
  // Datos de ejemplo para los tipos de sensores (hardcoded)
  sensorTypes$ = of([
    { _id: '1', name: 'Temperatura' },
    { _id: '2', name: 'Humedad' },
    { _id: '3', name: 'Presión' },
  ]);

  selectedSensorType: string; // Tipo de sensor seleccionado

  initialSensorName: string;
  initialSensorLocation: string;
  initialSensorType: string;

  constructor(
    public dialogRef: MatDialogRef<ViewSensorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Inicializar los datos del sensor
    this.initialSensorName = data.name;
    this.initialSensorLocation = data.location;
    this.initialSensorType = data.type;
    this.selectedSensorType = this.initialSensorType; // Tipo de sensor a mostrar
  }

  onClose() {
    this.dialogRef.close();
  }
}