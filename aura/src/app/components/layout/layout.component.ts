import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { PremiumSideComponent } from '../paymentUsers/side/side.component';
import { BottomTabComponent } from '../bottom-tab/bottom-tab.component';
import { SideComponent } from '../side/side.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone:true,
  imports: [PremiumSideComponent, BottomTabComponent, CommonModule,SideComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
 isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;
  showPremiumSide: boolean = false;

  constructor() {
    this.checkUserAuthority();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
    this.bodySizeChange.emit(this.isLargeScreen);
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  private checkUserAuthority() {
    const authString = sessionStorage.getItem('authorities');
    try {
      const authorities: string[] = JSON.parse(authString ?? '[]');
      this.showPremiumSide = authorities.includes('super_usuario');
    } catch (e) {
      console.error('Error parsing authorities from sessionStorage:', e);
      this.showPremiumSide = false;
    }
  }
}