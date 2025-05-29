// index.ts
import {
  Component,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../../side/side.component';
import { BottomTabComponent } from '../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../services/paymentUser/payment-user.service';
import { FiwareService } from '../../../../../../services/fiware/fiware.service';
import { SocketService } from '../../../../../../services/socket/socket.service';
import * as L from 'leaflet';
import { NgxGaugeModule } from 'ngx-gauge';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent, NgxGaugeModule, RouterModule],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class BuildingBranchIndexComponent implements OnInit, AfterViewInit, OnDestroy {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;
  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  entitiesWithAlerts: any[] = [];
  devicesInfo: any[] = [];
  private map: L.Map | undefined;
  private currentLocation: [number, number] = [13.7942, -88.8965];
  private currentZoom: number = 7;

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiwareService: FiwareService,
    private socketService: SocketService
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

        this.devicesInfo = entities.map((entity: any) => ({
          deviceName: entity.deviceName,
          color: entity.color,
          level: entity.level ?? 0,
          variableCount: entity.variables.length,
          actuadoresCount: entity.commands.length
        }));
      });
    } else {
      console.error('No se encontraron fiwareService o fiwareServicePath en sessionStorage');
    }

    this.socketService.entitiesWithAlerts$.subscribe((entities) => {
      console.log('Entidades recibidas por socket:', entities); 
      if (entities && entities.length > 0) {
        this.updateEntitiesWithSocket(entities);
      }
    });
  }

  private updateEntitiesWithSocket(newEntities: any[]) {
    const newEntitiesMap = new Map(newEntities.map(e => [e.id || e.deviceName, e]));

    this.entitiesWithAlerts = this.entitiesWithAlerts.map(existing => {
      const key = existing.id || existing.deviceName;
      return newEntitiesMap.get(key) || existing;
    });

    newEntities.forEach(newEntity => {
      const key = newEntity.id || newEntity.deviceName;
      if (!this.entitiesWithAlerts.some(e => (e.id || e.deviceName) === key)) {
        this.entitiesWithAlerts.push(newEntity);
      }
    });

    this.devicesInfo = this.entitiesWithAlerts.map((entity: any) => ({
      deviceName: entity.raw?.deviceName || entity.deviceName,
      color: entity.color || '#808080',
      level: entity.hasOwnProperty('nivel') ? entity.nivel : (entity.hasOwnProperty('level') ? entity.level : 0),
      variableCount: entity.variables?.length || 0,
      actuadoresCount: entity.commands?.length || 0
    }));

    this.loadEntitiesWithAlerts();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
    this.loadEntitiesWithAlerts();
  }

  private initializeMap(): void {
    if (!this.map) {
      this.map = L.map('map', { zoomControl: false })
        .setView(this.currentLocation, this.currentZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSpOxpG4Hy_wDmvTHwle-asB2c1SvEsJv84g&s" alt="IIIE" Width="30px"> <a href="" style="font-size:30px;">IIIE</a> <hr>Instituto de Investigación e Innovación en Electronica'
      }).addTo(this.map);
    }
  }

  private loadEntitiesWithAlerts(): void {
    const fiwareService = sessionStorage.getItem('fiware-service') || '';
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath') || '';

    let minLat: number = Infinity;
    let maxLat: number = -Infinity;
    let minLng: number = Infinity;
    let maxLng: number = -Infinity;

    let openedPopupDevice: string | null = null;
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.getPopup()?.isOpen()) {
          const popup = layer.getPopup();
          if (popup) {
            const content = popup.getContent();
            if (typeof content === 'string' && content.includes('<b>')) {
              const match = content.match(/<b>(.*?)<\/b>/);
              if (match) {
                openedPopupDevice = match[1];
              }
            }
          }
        }
      });
    }

    this.fiwareService.getEntitiesWithAlerts(fiwareService, fiwareServicePath)
      .subscribe((entities) => {
        console.log('Entidades con alertas:', entities);

        this.map?.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            this.map!.removeLayer(layer);
          }
        });

        entities.forEach((entity: any) => {
          if (entity.location?.value?.coordinates) {
            const [latitude, longitude] = entity.location.value.coordinates;

            minLat = Math.min(minLat, latitude);
            maxLat = Math.max(maxLat, latitude);
            minLng = Math.min(minLng, longitude);
            maxLng = Math.max(maxLng, longitude);

            const marker = this.addColoredMarker(
              latitude,
              longitude,
              entity.color,
              entity.displayName || entity.deviceName,
              entity.variables,
              entity.commands,
              entity.commandTypes,
              entity.timeInstant || entity.location?.metadata?.TimeInstant?.value
            );

            if (openedPopupDevice && (entity.displayName || entity.deviceName) === openedPopupDevice) {
              marker.openPopup();
            }
          }
        });

        if (this.map) {
          const bounds = L.latLngBounds(
            [minLat, minLng],
            [maxLat, maxLng]
          );
          this.map.fitBounds(bounds);
        }
      }, (error) => {
        console.error('Error al obtener entidades:', error);
      });
  }

  private addColoredMarker(
    lat: number,
    lng: number,
    color: string,
    name: string,
    variables: any[],
    commands?: any[],
    commandTypes?: any,
    timeInstant?: string
  ): L.Marker {
    if (!this.map) throw new Error('Mapa no inicializado');

    let popupContent = `<b>${name}</b><br>`;

    const hasSensors = Array.isArray(variables) && variables.length > 0;
    const hasActuators = Array.isArray(commands) && commands.length > 0;

    let anyCommandHasStatus = false;
    if (hasActuators) {
      anyCommandHasStatus = commands!.some(cmd => !!cmd.status);
    }

    const showGlobalAsCreation = !hasSensors && !anyCommandHasStatus;
    const mainDate = timeInstant || 'No disponible';

    if (mainDate) {
      popupContent += showGlobalAsCreation
        ? `<br><strong>Fecha de creación:</strong> ${mainDate} 📅<br><br>`
        : `<br><strong>· Última actualización:</strong> ${mainDate} 🕒<br><br>`;
    }

    if (hasSensors) {
      popupContent += `<b>📡 Sensores</b><ul>`;
      variables.forEach(variable => {
        popupContent += `<li>${variable.name}: ${variable.value}`;
        if (variable.alert) {
          popupContent += ` <span style="color:${variable.alert.color}">(${variable.alert.name})</span>`;
        }
        popupContent += `</li>`;
      });
      popupContent += `</ul>`;
    }

    if (commandTypes && hasActuators) {
      popupContent += `<b>⚙️ Actuadores</b><ul>`;

      Object.keys(commandTypes).forEach((typeKey: string) => {
        const commandList = commandTypes[typeKey];

        commandList.forEach((cmd: any) => {
          const cmdName = cmd.name;
          const cmdLabel = cmd.label || cmd.name;
          const commandObj = commands.find(cmdObj => cmdObj.name === cmdName);

          if (!commandObj) return;

          const status = commandObj.status;
          const states = commandObj.states;
          const statusTimeInstant = commandObj.statusTimeInstant || 'No disponible';

          const readableStates = states
            ? `· Estado actual: <i>${states}</i> ✅`
            : `· Estado actual: <i style="color:#93c5fd;">No reportado</i> ⚠️`;

          let readableStatusText = 'No reportado';
          let statusColor = '#3498db';

          if (status) {
            const normalizedStatus = status.toLowerCase();
            if (normalizedStatus === 'ok') {
              readableStatusText = 'OK 🟢';
              statusColor = '#2ecc71';
            } else if (normalizedStatus === 'pending') {
              readableStatusText = 'PENDIENTE 🟠';
              statusColor = '#f39c12';
            } else {
              readableStatusText = `${status.toUpperCase()} 🔴`;
              statusColor = '#e74c3c';
            }
          }

          const showCommandAsCreation = !status;

          popupContent += `
<li><b>${cmdLabel}</b>:<br>
  ${readableStates}<br>
  · Estado del sistema: <span style="color:${statusColor}; font-weight: bold;">${readableStatusText}</span><br>
  ${showCommandAsCreation
    ? `Fecha de creación: ${statusTimeInstant} 📅`
    : `· Última actualización (hora): ${statusTimeInstant}`}
</li>`;
        });
      });

      popupContent += `</ul>`;
    }

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%;"></div>`,
      iconSize: [20, 20],
    });

    return L.marker([lat, lng], { icon: customIcon }).addTo(this.map).bindPopup(popupContent);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
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

  onBackClick() {
    this.router.navigate([`/premium/building/${this.buildingName}/branch/${this.branchId}`]);
  }

  onCreateClick() {
    this.router.navigate([`/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/create/devices`]);
  }

  getNumericValue(value: string): number {
    return parseFloat(value) || 0;
  }

  onViewDevice(deviceName: string) {
    console.log('Ver dispositivo:', deviceName);
    this.router.navigate([
      `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${deviceName}`
    ]);
  }
}
