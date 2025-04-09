import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // Importar ActivatedRoute
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../../../side/side.component';
import { BottomTabComponent } from '../../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../../services/paymentUser/payment-user.service';
import { FiwareService } from '../../../../../../../services/fiware/fiware.service'; // Importar FiwareService
import { NgxGaugeModule } from 'ngx-gauge';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent, NgxGaugeModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsDeviceComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  entitiesWithAlerts: any[] = []; // Para almacenar las entidades con alertas

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiwareService: FiwareService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
    });

    const fiwareService = sessionStorage.getItem('fiware-service');
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath');
    
    if (fiwareService && fiwareServicePath) {
      this.fiwareService.getEntitiesWithAlerts(fiwareService, fiwareServicePath).subscribe(entities => {
        this.entitiesWithAlerts = entities;
      });
    } else {
      console.error('No se encontraron fiwareService o fiwareServicePath en sessionStorage');
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  onBackClick() {
    this.router.navigate([`/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}`]);
  }

  onCreateClick() {
    this.router.navigate([`/premium/devices`]);
  }

// Método para obtener el valor numérico
getNumericValue(value: string): number {
  return parseFloat(value) || 0;
}

// Método para obtener el rango dinámico (min y max) según la alerta
getGaugeRange(variable: any): { min: number, max: number } {
  if (variable.alert) {
    return {
      min: variable.alert.minRange !== null ? variable.alert.minRange : 0,  // Usamos 0 si no tiene minRange
      max: variable.alert.maxRange !== null ? variable.alert.maxRange : 100  // Usamos 100 si no tiene maxRange
    };
  } else {
    return { min: 0, max: 100 };
  }
}

// Método para obtener los thresholds para el color del gauge
getGaugeThresholds(variable: any): any[] {
  // Si existe una alerta, usamos el color de la alerta para el threshold
  if (variable.alert) {
    return [
      {
        value: variable.alert.minRange !== null ? variable.alert.minRange : 0, // Min del threshold
        color: variable.alert.color || '#fff'  // Color de la alerta o blanco
      },
      {
        value: variable.alert.maxRange !== null ? variable.alert.maxRange : 100, // Max del threshold
        color: variable.alert.color || '#fff'  // Color de la alerta o blanco
      }
    ];
  } else {
    // Si no tiene alerta, usamos el color blanco para todo el rango
    return [
      {
        value: 0,
        color: '#fff'
      },
      {
        value: 100,
        color: '#fff'
      }
    ];
  }
}

// Método para obtener el color según la alerta
getGaugeColor(variable: any): string {
  if (variable.alert) {
    return variable.alert.color || '#fff'; // Devolvemos el color de la alerta
  } else {
    return '#fff'; // Si no hay alerta, devolvemos blanco
  }
}
}
