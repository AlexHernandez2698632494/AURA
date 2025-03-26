import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../side/side.component';
import { BottomTabComponent } from '../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.css'
})
export class BuildingBranchComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  subscriptionsCount: number = 0;
  subscriptionsList: { name: string; isExpired: boolean }[] = [];
  usersCount: number = 0;
  branches: any[] = [];
  branchImages: { [id: string]: string } = {};

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute // Inyectar ActivatedRoute
  ) {}
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  ngOnInit(): void {
    // Obtener el 'id' de los parámetros de la URL y cargar el edificio
    const nivel = this.activatedRoute.snapshot.paramMap.get('id');
    const buildingName = this.activatedRoute.snapshot.paramMap.get('buildingName')
    console.log("el nivel es ",nivel)
    console.log("el nombre es ",buildingName)
    if (nivel && buildingName) {
      this.loadBuilding(buildingName, nivel); // Llamar a loadBuilding pasando el id
    }
  }
  loadBuilding(name:string, id: string): void {
    this.paymentUserService.getBranchById(name, id).subscribe({
      next: (data) => {
        console.log('Respuesta del servicio:', data);
  
        // Convertir el objeto en un arreglo
        this.branches = [data];  // `buildings` ahora es un arreglo con un solo objeto
  
        // Acceder al primer (y único) elemento del arreglo
        const branch = this.branches[0];  // Acceder al objeto
        console.log("d",branch.salones[0].imagen_salon)
        // Ahora puedes acceder a las propiedades del objeto  
        if (branch.salones) {
          this.loadImage(branch.salones[0].imagen_salon);
        }
      },
      error: (err) => {
        console.error('Error al obtener los edificios:', err);
      }
    });
  }
  
  loadImage(imageId: string): void {
    this.paymentUserService.getBranchImageById(imageId).subscribe({
      next: (imageBlob) => {
        const imageUrl = URL.createObjectURL(imageBlob);
        this.branchImages[imageId] = imageUrl;
      },
      error: (err) => {
        console.error('Error al obtener la imagen:', err);
      }
    });
  }
  onBackClick(): void {
    const edificioId = this.branches[0]?.salones[0]?.edificioId; // Obtener el id del edificio
    if (edificioId) {
      // Redirigir a la ruta /premium/building/index/:id
      this.router.navigate([`/premium/building/index/${edificioId}`]);
    } else {
      console.error('No se encontró el edificioId');
    }
  }
  
  CreateBranch(): void {
    this.router.navigate(['/premium/building/branch/create']);
  }
}