import { Component, HostListener, Output, EventEmitter } from '@angular/core';
import { SideComponent } from '../side/side.component';
import { BottomTabComponent } from '../bottom-tab/bottom-tab.component';
import { PremiumSideComponent } from '../paymentUsers/side/side.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [SideComponent, BottomTabComponent,PremiumSideComponent, CommonModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  isPremiumUser: boolean = false;

  @Output() bodySizeChange = new EventEmitter<boolean>();

  // Detectar el tipo de usuario desde sessionStorage
  ngOnInit(): void {
    const authorities = JSON.parse(sessionStorage.getItem('authorities') || '[]');
    if (authorities.includes('super_usuario')) {
      this.isPremiumUser = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }
}
