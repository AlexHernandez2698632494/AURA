import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { LayoutComponent } from "../layout/layout.component";


@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule,
    LayoutComponent,
    MatButtonModule, LayoutComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class AdminOverviewComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  ngOnInit(): void {
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  constructor(
    private router: Router,
  ) {
    // Inicialización si es necesaria
  }

}
