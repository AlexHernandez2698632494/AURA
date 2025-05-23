import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideComponent } from '../side/side.component';
import { BottomTabComponent } from '../bottom-tab/bottom-tab.component';


@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, SideComponent, BottomTabComponent],
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

}
