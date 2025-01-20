import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
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
    RouterOutlet,
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
  templateUrl: './index-e.component.html',
  styleUrls: ['./index-e.component.css'],
})
export class IndexESessionComponent implements OnInit {
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
  selectedLevel: number | null = null; // Variable para el nivel seleccionado

  Math = Math;

  constructor(private historyService: HistoryService, private router: Router) {}

  ngOnInit() {
    // Inicializar con las sesiones eliminadas
    this.loadSessions();
  }

  // Cargar las sesiones eliminadas
  loadSessions() {
    this.historyService.getDeletedHistory().subscribe({
      next: (data) => {
        this.sessions = data;
      },
      error: (err) => {
        console.error('Error al cargar las sesiones eliminadas:', err);
      },
    });
  }

  // Filtrar las sesiones con base en el término de búsqueda y el nivel
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

  // Total de páginas para la paginación
  totalPages() {
    return Math.ceil(this.sessions.length / this.recordsToShow);
  }

  // Página siguiente
  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  // Página anterior
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

    // Método para guardar el nivel seleccionado en sessionStorage
    onLevelChange() {
      if (this.selectedLevel !== null) {
        sessionStorage.setItem('selectedLevel', this.selectedLevel.toString());
      }
    }
    cleanSlate() {
      // Mostrar el mensaje de confirmación
      Swal.fire({
        title: 'Sabes qué hacer',
        text: '¿El Protocolo Clean Slate, señor?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Si',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,  // Para cambiar el orden de los botones
      }).then((result) => {
        if (result.isConfirmed) {
          // Recuperar el nivel de sessionStorage
          const selectedLevel = sessionStorage.getItem('selectedLevel');
          
          if (selectedLevel) {
            this.historyService.cleanSlateByLevel(selectedLevel).subscribe({
              next: (response) => {
                Swal.fire('¡Hecho!', 'Protocolo Clean Slate activated. ¡Happy Hacking! 💻', 'success');
                this.loadSessions();  // Recargar sesiones después de limpiar el historial
              },
              error: (err) => {
                Swal.fire('Error', 'Hubo un problema al limpiar el historial.', 'error');
                console.error('Error al limpiar el historial:', err);
              }
            });
          } else {
            Swal.fire('Error', 'No se ha seleccionado un nivel válido.', 'error');
          }
        } else {
          Swal.fire('Cancelado', 'La acción ha sido cancelada. 🎁', 'info');
        }
      });
    }
    
    permanentDelete(historyId: string) {
      this.historyService.permanentDeleteHistory(historyId).subscribe({
        next: (response) => {
          Swal.fire('Éxito', 'La entrada de historial se ha eliminado permanentemente.', 'success');
          this.loadSessions();  // Recargar sesiones después de eliminar permanentemente
        },
        error: (err) => {
          Swal.fire('Error', 'Hubo un problema al eliminar permanentemente la entrada.', 'error');
          console.error('Error al eliminar la entrada:', err);
        }
      });
    }
        
}
