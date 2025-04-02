import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../../side/side.component';
import { BottomTabComponent } from '../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class BuildingBranchIndexComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute // Inyectar ActivatedRoute
  ) {}

  ngOnInit() {
    // Extraer los parámetros de la ruta
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  // Función para el botón de "Regresar"
  onBackClick() {
    // Redirigir a la ruta de regreso
    this.router.navigate([`/premium/building/${this.buildingName}/branch/${this.branchId}`]);
  }

  // Función para el botón de "Crear Dispositivo"
  onCreateClick() {
    // Redirigir a la ruta para crear un dispositivo
    this.router.navigate([`/premium/devices`]);
  }
}
