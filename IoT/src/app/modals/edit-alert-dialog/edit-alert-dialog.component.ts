import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxColorsModule } from 'ngx-colors';

@Component({
  selector: 'app-edit-alert-dialog',
  standalone: true,
  imports: [    
    NgxColorsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    MatSelectModule,],
  templateUrl: './edit-alert-dialog.component.html',
  styleUrl: './edit-alert-dialog.component.css'
})
export class EditAlertDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditAlertDialogComponent>){}

    color:string = '#EC407A';

  onCancel() {
    this.dialogRef.close();
  }

  onSave(){
    Swal.fire({
              title: 'Éxito!',
              text: 'El usuario se ha actualizado correctamente.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
            this.dialogRef.close();
  }

}
