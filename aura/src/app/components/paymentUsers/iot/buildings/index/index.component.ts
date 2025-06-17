import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../side/side.component';
import { BottomTabComponent } from '../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class BuildingIndexComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  subscriptionsCount: number = 0;
  subscriptionsList: { name: string; isExpired: boolean }[] = [];
  usersCount: number = 0;
  buildings: any[] = [];
  buildingImages: { [id: string]: string } = {};

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute // Inyectar ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el 'id' de los parámetros de la URL y cargar el edificio
    const buildingId = this.activatedRoute.snapshot.paramMap.get('id'); // Obtener el 'id' de la URL
    console.log(buildingId)
    if (buildingId) {
      this.loadBuilding(buildingId); // Llamar a loadBuilding pasando el id
    }
  }

  loadBuilding(id: string): void {
    this.paymentUserService.getBuildingById(id).subscribe({
      next: (data) => {
        console.log('Respuesta del servicio:', data);
  
        // Convertir el objeto en un arreglo
        this.buildings = [data];  // `buildings` ahora es un arreglo con un solo objeto
  
        // Acceder al primer (y único) elemento del arreglo
        const building = this.buildings[0];  // Acceder al objeto
  
        // Ahora puedes acceder a las propiedades del objeto
        if (building.imagenPrincipal) {
          this.loadImage(building.imagenPrincipal);
        }
  
        // Si hay imágenes adicionales (por ejemplo, imagenesPlantas)
        if (building.imagenesPlantas && Array.isArray(building.imagenesPlantas)) {
          building.imagenesPlantas.forEach((imageId: string) => { // Especificamos el tipo de `imageId` como string
            this.loadImage(imageId);
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener los edificios:', err);
      }
    });
  }
  
  

  loadImage(imageId: string): void {
    this.paymentUserService.getImageById(imageId).subscribe({
      next: (imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        this.buildingImages[imageId] = imageUrl;
      },
      error: (err) => {
        console.error('Error al obtener la imagen:', err);
      }
    });
  }

  navigateToViewBranch(buildingName:string, nivel:number) : void{
    this.router.navigate([`/premium/iot/overview/building/${buildingName}/branch/${nivel}`]);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  onBackClick(): void {
    this.router.navigate([`/premium/iot/overview/building/`]);
  } 
}
