import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';  // Importar SweetAlert2
import { EditAlertDialogComponent } from '../../../modals/edit-alert-dialog/edit-alert-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-index-alert',
  imports: [
    RouterOutlet,
    SideComponent,
    BottomTabComponent,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexAlertComponent {
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
  constructor(private dialog: MatDialog) { }
  editAlert() {
    const dialogRef = this.dialog.open(EditAlertDialogComponent, {
      width: '400px'
    });
  }

  deleteAlert() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro que deseas eliminar la alerta tal?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!',
    }).then((result) => {
      if (result.isConfirmed) {

        Swal.fire('Eliminado!', `La alerta ha sido eliminado correctamente.`, 'success');
      }
    });
  }
}