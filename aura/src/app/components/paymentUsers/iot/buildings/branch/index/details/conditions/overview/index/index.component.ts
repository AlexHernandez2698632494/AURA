import { Component, OnInit, HostListener, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../../../../../../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../../../../../../../../side/side.component';
import { BottomTabComponent } from '../../../../../../../../../bottom-tab/bottom-tab.component';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FiwareService } from '../../../../../../../../../../services/fiware/fiware.service';

@Component({
  selector: 'app-index-conditions',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexConditionsComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  subscriptions: any[] = [];
  isLoading = true;
  errorMessage = '';
  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  deviceName: string = '';
  commandName: string = '';
  rulesData: any = null;
  idActuador: string = '';

  @Output() bodySizeChange = new EventEmitter<boolean>();

  constructor(private paymentUserService: PaymentUserService, private router: Router,
    private activatedRoute: ActivatedRoute, private fiwareService: FiwareService
  ) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true;

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  onBackClick() {
    this.router.navigate([
      `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}`,
    ]);
  }

ngOnInit() {
  this.activatedRoute.paramMap.subscribe(params => {
    this.buildingName = params.get('buildingName') || '';
    this.branchName = params.get('branchName') || '';
    this.branchId = params.get('id') || '';
    this.deviceName = params.get('deviceName') || '';
    this.commandName = params.get('idActuador') || '';

    // Obtener idActuador desde el servicio o sessionStorage
    let idActuadorFromService = this.fiwareService.getIdActuador();

    if (idActuadorFromService) {
      this.idActuador = idActuadorFromService;
      // Guardarlo en sessionStorage si no existe aún
      if (!sessionStorage.getItem('idActuador')) {
        sessionStorage.setItem('idActuador', this.idActuador);
      }
    } else {
      // Recuperar desde sessionStorage si no hay valor en el servicio
      const storedIdActuador = sessionStorage.getItem('idActuador');
      this.idActuador = storedIdActuador || '';
    }

    // Hacer la petición si tenemos datos suficientes
    if (this.idActuador && this.commandName) {
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(this.idActuador, this.commandName)
        .subscribe({
          next: (response) => {
            console.log('Respuesta de getRulesByServiceSubserviceActuatorAndCommand:', response);
            this.rulesData = response?.[0];
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al obtener condiciones:', error);
            this.errorMessage = 'No se pudieron obtener las condiciones.';
            this.isLoading = false;
          }
        });
    }
  });
}

  translateConditionType(type: string): string {
  switch (type) {
    case 'greater': return 'Mayor que';
    case 'less': return 'Menor que';
    case 'between': return 'Entre';
    case 'equal': return 'Igual a';
    case 'function': return 'Función personalizada';
    default: return type;
  }
}

getConditionLogicText(logic: string): string {
  return logic === 'AND'
    ? 'Se deben cumplir todas las condiciones'
    : logic === 'OR'
    ? 'Se debe cumplir al menos una condición'
    : logic;
}

}