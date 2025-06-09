import { Component, OnInit, HostListener, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../../../../../../side/side.component';
import { BottomTabComponent } from '../../../../../../../../bottom-tab/bottom-tab.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FiwareService } from '../../../../../../../../../services/fiware/fiware.service';
import { SocketService } from '../../../../../../../../../services/socket/socket.service';
import { take } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-overview-conditions',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent, MatIconModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewConditionsComponent {
  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  entitiesWithAlerts: any[] = [];
  deviceName: string = '';
  commandName: string = '';
  idEntities: string = '';
  commands: any[] = [];
  ruleStats: any = {};

  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiwareService: FiwareService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
      this.deviceName = params.get('deviceName') || '';
      this.commandName = params.get('idActuador') || '';
    });

    console.log("params", this.router.url);
    console.log("deviceName", this.deviceName);
    console.log("command", this.commandName);

    const fiwareService = sessionStorage.getItem('fiware-service');
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath');

    if (!fiwareService || !fiwareServicePath) {
      console.error('❌ No se encontraron fiwareService o fiwareServicePath en sessionStorage');
      return;
    }

    this.socketService.entitiesWithAlerts$.pipe(take(1)).subscribe((entities: any[]) => {
      const entidad = entities.find(e => {
        const name = e.deviceName || (e.raw && e.raw.deviceName);
        return name === this.deviceName;
      });

      if (!entidad) {
        console.warn("⚠ No se encontró entidad con deviceName:", this.deviceName);
        return;
      }

      this.entitiesWithAlerts = [entidad];
      const tipo = entidad.isSensorActuador;
      this.idEntities = this.entitiesWithAlerts[0]?.id || '';
      console.log("id", this.idEntities);
      console.log("datos recibidos por socket", this.entitiesWithAlerts);

      // ✅ Llamamos al servicio getRuleStats
      const payload = { id: this.idEntities };
      this.fiwareService.getRuleStats().subscribe(stats => {
        this.ruleStats = stats;
        console.log('📊 Stats recibidas:', this.ruleStats);
        this.cdr.detectChanges(); // Para asegurar que se refleje en el DOM
      });
    });

    setTimeout(() => {
      if (!this.socketService.hasReceivedData()) {
        this.socketService.loadEntitiesFromAPI(fiwareService, fiwareServicePath, this.fiwareService);
      }
    }, 1);
  }

  onCreateCondition() {
    this.fiwareService.setIdActuador(this.idEntities);
    this.router.navigate([
      `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}/${this.commandName}/conditions/create`
    ]);
  }

  onBackClick() {
    this.router.navigate([
      `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}`,
    ]);
  }
}
