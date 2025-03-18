import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../services/paymentUser/payment-user.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent,MatIconModule, BottomTabComponent],
  templateUrl: './buildings.component.html',
  styleUrl: './buildings.component.css'
})
export class BuildingsComponent {
    isLargeScreen: boolean = window.innerWidth > 1024;
    @Output() bodySizeChange = new EventEmitter<boolean>();
    isSidebarCollapsed = true;
    
    subscriptionsCount: number = 0;
    subscriptionsList: { name: string; isExpired: boolean }[] = []; // Definir correctamente el array
    usersCount: number = 0;
    buildings: any[] = [];
    constructor(
      private paymentUserService: PaymentUserService,
      private router: Router  // Inyectamos el servicio Router
    ) {}
    
    ngOnInit(): void {
      // Llamamos al servicio para obtener los edificios
      this.loadBuildings();
    }
  
    // Lógica para obtener los edificios
    loadBuildings(): void {
      this.paymentUserService.getBuildings().subscribe({
        next: (data) => {
          this.buildings = data;  // Almacenamos los edificios en la variable
          console.log('Edificios obtenidos:', this.buildings);
        },
        error: (err) => {
          console.error('Error al obtener los edificios:', err);
        }
      });
    }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  // Método para redirigir a la página de crear edificio
  navigateToCreateBuilding(): void {
    this.router.navigate(['/premium/building/create']);
  }
}
