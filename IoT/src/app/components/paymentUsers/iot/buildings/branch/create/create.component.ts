import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../../../side/side.component';
import { BottomTabComponent } from '../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../services/paymentUser/payment-user.service';
import { Router } from '@angular/router';
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
  styleUrl: './create.component.css'
})
export class BuildingBranchCreateComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  subscriptionsCount: number = 0;
  subscriptionsList: { name: string; isExpired: boolean }[] = [];
  usersCount: number = 0;
  BranchForm: FormGroup;
  imagePrincipalName: string = '';
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.BranchForm = this.fb.group({
      nombre: ['', [Validators.required]],
      nivel: ['', [Validators.required]],
      imagenPrincipal: [null, [Validators.required]],
    });
  }

  registerBranch(): void {

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
