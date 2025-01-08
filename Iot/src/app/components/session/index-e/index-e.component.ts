import { Component, OnInit } from '@angular/core';
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
import { HistoryService } from '../../../services/history.service';
import { NavComponent } from '../../nav/nav.component';

@Component({
  selector: 'app-index-session',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    NavComponent,
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
export class IndexSessionComponent implements OnInit {
  sessions: any[] = [];
  searchTerm: string = '';
  recordsToShow: number = 5;
  currentPage: number = 1;
  Math = Math;

  constructor(private historyService: HistoryService, private router: Router) {}

  ngOnInit() {
    this.loadSessions();
  }

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

  filteredSessions() {
    const filtered = this.sessions.filter((session) =>
      session.username.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
