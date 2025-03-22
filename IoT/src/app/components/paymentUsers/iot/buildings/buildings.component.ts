import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../services/paymentUser/payment-user.service';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent],
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
  buildingImages: { [id: string]: string } = {};
  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router  // Inyectamos el servicio Router
  ) { }

  ngOnInit(): void {
    // Llamamos al servicio para obtener los edificios
    this.loadBuildings();
  }

  loadBuildings(): void {
    this.paymentUserService.getBuildings().subscribe({
      next: (data) => {
        this.buildings = data;
        console.log('Edificios obtenidos:', this.buildings);

        // Cargar las imágenes después de obtener los edificios
        this.buildings.forEach(building => {
          if (building.imagenPrincipal) {
            this.loadImage(building.imagenPrincipal);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener los edificios:', err);
      }
    });
  }

  loadImage(imageId: string): void {
    this.paymentUserService.getImageById(imageId).subscribe({
      next: (imageBlob) => {
        // Crear una URL de la imagen con el Blob obtenido
        const imageUrl = URL.createObjectURL(imageBlob);
        this.buildingImages[imageId] = imageUrl;
      },
      error: (err) => {
        console.error('Error al obtener la imagen:', err);
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

  // Método para redirigir a la página de ver edificio
  navigateToViewBuilding(buildingId: string): void {
    this.router.navigate([`/premium/building/index`, buildingId]);
  }

  // Método para redirigir a la página de editar edificio
  navigateToEditBuilding(buildingId: string): void {
    console.log(buildingId)
    this.router.navigate([`/premium/building/update`]);
  }

  // Método para redirigir a la página de crear edificio
  navigateToCreateBuilding(): void {
    this.router.navigate(['/premium/building/create']);
  }
  deleteBuilding(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Si el usuario confirma la eliminación
        this.paymentUserService.deleteBuilding(id).subscribe({
          next: () => {
            // Eliminar el edificio de la lista después de la eliminación exitosa
            this.buildings = this.buildings.filter(building => building._id !== id);
            Swal.fire('Eliminado!', 'El edificio ha sido eliminado.', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar el edificio', err);
            Swal.fire('Error', 'No se pudo eliminar el edificio', 'error');
          }
        });
      } else {
        // Si el usuario cancela
        Swal.fire('Cancelado', 'El edificio no ha sido eliminado', 'error');
      }
    });
  }

}
