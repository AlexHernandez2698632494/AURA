import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';  // Importar SweetAlert2
import { FiwareService } from '../../../services/fiware/fiware.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-index-key',
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
  styleUrl: './index.component.css'
})
export class KeyIndexComponent {
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
  keys: any[] = [];
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  Math = Math;
  constructor(private router: Router,
    private dialog: MatDialog, private fiwareService: FiwareService) { }

  filteredKeys() {
    const filtered = this.keys.filter(key =>
      key.key.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      key.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      key.authotities.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    const start = (this.currentPage - 1) * this.recordsToShow;
    const end = start + this.recordsToShow;
    return filtered.slice(start, end);
  }

  totalPages() {
    return Math.ceil(this.keys.length / this.recordsToShow);
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
  ngOnInit(): void {
    this.fiwareService.getApiKeys().subscribe(apiKeys => {
      // Formatear los apikeys
      const formattedApiKeys = apiKeys.map(k => ({
        key: k.key,
        type: k.type,
        authotities: k.authority?.type || 'N/A'  // Acceder al nombre de la autoridad
      }));
  
      this.fiwareService.getDeviceKeys().subscribe(deviceKeys => {
        // Formatear los device keys
        const formattedDeviceKeys = deviceKeys.map(k => ({
          key: k.key,
          type: k.type,
          authotities: k.authority?.type || 'N/A'  // Acceder al nombre de la autoridad
        }));
  
        // Combina ambos conjuntos de datos
        this.keys = [...formattedApiKeys, ...formattedDeviceKeys];
      });
    });
  }
    
}
