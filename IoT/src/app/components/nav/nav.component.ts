import { Component, HostListener } from '@angular/core';
import { SideComponent } from '../side/side.component';
import { BottomTabComponent } from '../bottom-tab/bottom-tab.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [SideComponent, BottomTabComponent, CommonModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;

  // Detectar cambios en el tamaño de la ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // Verifica que el evento resize se esté disparando
  //  console.log('Redimensionando...', window.innerWidth);
    this.isLargeScreen = window.innerWidth > 1024;
   // console.log('isLargeScreen actualizado:', this.isLargeScreen);  // Verifica si el valor se actualiza
  }
}
