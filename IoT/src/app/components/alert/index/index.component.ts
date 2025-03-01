import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { CommonModule } from '@angular/common';
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
import { AlertService } from '../../../services/alert/alert.service'; // Importar el servicio para alertas

@Component({
  selector: 'app-index-alert',
  standalone: true,
  imports: [
    SideComponent,
    BottomTabComponent,
    FormsModule,
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexAlertComponent implements OnInit {
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

  alerts: any[] = [];  // Array para almacenar las alertas
  searchTerm: string = '';  // Término de búsqueda
  recordsToShow: number = 5;  // Registros a mostrar
  currentPage: number = 1;  // Página actual
  Math = Math;  // Para usar Math en la plantilla

  constructor(
    private dialog: MatDialog,
    private alertService: AlertService,  // Servicio para obtener las alertas
    private router: Router
  ) { }

  ngOnInit() {
    this.loadAlerts();  // Cargar alertas al iniciar
  }

  loadAlerts() {
    const token = sessionStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'No se encuentra el token',
        text: 'Por favor, inicie sesión nuevamente.',
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }

    this.alertService.getAlerts().subscribe({
      next: (data) => {
        this.alerts = data.content;  // Asignar las alertas al array
        console.log('Alertas cargadas:', this.alerts);
      },
      error: (err) => {
        console.error('Error al cargar las alertas:', err);
      },
    });
  }

  editAlert() {
    const dialogRef = this.dialog.open(EditAlertDialogComponent, {
      width: '400px'
    });
  }

  deleteAlert() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Estás seguro que deseas eliminar la alerta tal?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Eliminado!', 'La alerta ha sido eliminada correctamente.', 'success');
      }
    });
  }

  // Filtro para buscar alertas
  filteredAlerts() {
    const isSearchTermNumber = !isNaN(Number(this.searchTerm.trim())); // Verifica si el término es un número
    const isSearchTermDecimal = this.searchTerm.includes('.'); // Verifica si el término tiene un punto (es un decimal)
  
    const filtered = this.alerts.filter((alert) => {
      if (isSearchTermNumber && !isSearchTermDecimal) {
        // Si el término de búsqueda es un número entero, buscar solo en 'level'
        return alert.level.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
      } else if (isSearchTermNumber && isSearchTermDecimal) {
        // Si el término de búsqueda es un número decimal, buscar en 'initialRange' y 'finalRange'
        return (
          alert.initialRange.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          alert.finalRange.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      } else {
        // Si el término de búsqueda empieza con letra, buscar en 'displayName' y 'variable'
        return (
          alert.displayName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          alert.variable.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          alert.initialRange.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          alert.finalRange.toString().toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          alert.color.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    });
  
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtered.slice(start, end);
  }
  
  totalPages() {
    return Math.ceil(this.alerts.length / this.recordsToShow);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  // Cambiar la página actual si es mayor que el total de páginas
onRecordsChange() {
  const totalPages = this.totalPages();
  // Si la página actual excede el número total de páginas, ir a la última página
  if (this.currentPage > totalPages) {
    this.currentPage = totalPages;
  }
}

}
