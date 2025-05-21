import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import Swal from 'sweetalert2';
import { HistoryService } from '../../../services/history/history.service';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';

@Component({
  selector: 'app-index-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SideComponent,
    BottomTabComponent,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexSessionComponent implements OnInit {
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
  sessions: any[] = [];
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  selectedLevel: number | null = null;

  Math = Math;

  constructor(
    private historyService: HistoryService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar el valor del nivel desde sessionStorage si existe
    const storedLevel = sessionStorage.getItem('selectedLevel');
    if (storedLevel) {
      this.selectedLevel = parseInt(storedLevel, 10);
    } else {
      this.selectedLevel = null; // Asegurarnos de que selectedLevel sea null si no está en sessionStorage
    }

    this.loadSessions();
  }

  // Método para guardar el nivel seleccionado en sessionStorage
  onLevelChange() {
    if (this.selectedLevel !== null) {
      sessionStorage.setItem('selectedLevel', this.selectedLevel.toString());
    }
  }

  // Función que maneja el evento del botón cleanSlate
// Función que maneja el evento del botón cleanSlate
onCleanSlate() {
  if (this.selectedLevel === null) {
    Swal.fire('Error', 'Por favor, selecciona un nivel antes de limpiar el historial.', 'error');
    return;
  }

  // Confirmación del usuario antes de proceder
  Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará todas las entradas de historial de este nivel.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      // Asegurándonos de que selectedLevel no sea null antes de realizar la llamada
      const levelString = this.selectedLevel?.toString(); // Usar la comprobación de null (?)
      if (levelString) {
        this.historyService.deleteStateByLevel(levelString).subscribe({
          next: () => {
            Swal.fire('Historial limpiado', 'El historial del nivel seleccionado ha sido eliminado.', 'success');
            this.loadSessions(); // Recargar sesiones después de la eliminación
          },
          error: (err) => {
            Swal.fire('Error', 'Ocurrió un error al intentar eliminar el historial.', 'error');
          },
        });
      } else {
        Swal.fire('Error', 'El nivel seleccionado no es válido.', 'error');
      }
    }
  });
}


  // Función para cargar las sesiones
  loadSessions() {
    this.historyService.getHistory().subscribe({
      next: (data) => {
        this.sessions = data;
        console.log(this.sessions)
      },
      error: (err) => {
        console.error('Error al cargar las sesiones:', err);
      },
    });
  }

  // Función que maneja la eliminación de un historial específico
  onDeleteHistory(historyId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará permanentemente el historial.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('Confirmación recibida, eliminando historial con ID:', historyId);
        this.historyService.deleteHistory(historyId).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El historial ha sido eliminado correctamente.', 'success');
            this.loadSessions(); // Recargar sesiones después de la eliminación
          },
          error: (err) => {
            Swal.fire('Error', 'Ocurrió un error al eliminar el historial.', 'error');
          },
        });
      }
    });
  }
  

  filteredSessions() {
    let filtered = this.sessions.filter((session) =>
      session.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.selectedLevel !== null) {
      filtered = filtered.filter((session) => session.nivel === this.selectedLevel);
    }

    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtered.slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.sessions.length / this.recordsToShow);
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
}
