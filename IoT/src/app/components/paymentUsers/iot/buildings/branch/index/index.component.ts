import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../../side/side.component';
import { BottomTabComponent } from '../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../services/paymentUser/payment-user.service';
import { FiwareService } from '../../../../../../services/fiware/fiware.service';
import { SocketService } from '../../../../../../services/socket/socket.service'; // ✅ Agregado
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
    private socketService: SocketService // ✅ Inyectado
  ) { }

  ngOnInit() {
    // Extraer los parámetros de la ruta
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
    });

    // Obtener los datos de Fiware desde sessionStorage
    const fiwareService = sessionStorage.getItem('fiware-service');
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath');

    if (fiwareService && fiwareServicePath) {
      this.fiwareService.getEntitiesWithAlerts(fiwareService, fiwareServicePath).subscribe(entities => {
        this.entitiesWithAlerts = entities;

        // Procesar la información de los dispositivos
        this.devicesInfo = entities.map((entity: any) => ({
          deviceName: entity.deviceName,
          color: entity.color,
          level: entity.level,
          variableCount: entity.variables.length,
        }));
      });
    } else {
      console.error('No se encontraron fiwareService o fiwareServicePath en sessionStorage');
    }

    // ✅ Suscripción al socket
    this.socketService.entitiesWithAlerts$.subscribe((entities) => {
      if (entities && entities.length > 0) {
        this.entitiesWithAlerts = entities;

        this.devicesInfo = entities.map((entity: any) => ({
          deviceName: entity.raw.deviceName,
          color: entity.color,
          level: entity.nivel,
          variableCount: entity.variables.length,
        }));

        // Recarga el mapa con los datos nuevos
        this.loadEntitiesWithAlerts();
      }
    });
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

    // 1️⃣ Obtener el nombre del dispositivo con popup abierto (si hay)
    let openedPopupDevice: string | null = null;
    if (this.map) {
      this.map.eachLayer(layer => {
        if (layer instanceof L.Marker && layer.getPopup()?.isOpen()) {
          const popup = layer.getPopup();
          if (popup) {
            const content = popup.getContent();

            // ✅ Solo si el contenido es un string
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

        // 2️⃣ Eliminar solo los marcadores previos
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

            // 3️⃣ Añadir marcador y verificar si hay que abrir el popup
            const marker = this.addColoredMarker(
              latitude,
              longitude,
              entity.color,
              entity.displayName,
              entity.type,
              entity.variables
            );

            if (openedPopupDevice && entity.type === openedPopupDevice) {
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


  private addColoredMarker(lat: number, lng: number, color: string, name: string, type: string, variables: any[]): L.Marker {
    if (!this.map) throw new Error('Mapa no inicializado');

    let popupContent = `<b>${type}</b><br>`;
    if (variables?.length) {
      popupContent += '<ul>';
      variables.forEach(variable => {
        popupContent += `<li>${variable.name}: ${variable.value}`;
        if (variable.alert) {
          popupContent += ` - <span style="color:${variable.alert.color}">(${variable.alert.name})</span>`;
        }
        popupContent += '</li>';
      });
      popupContent += '</ul>';
    }

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 20px; height: 20px; background-color: ${color}; border-radius: 50%;"></div>`,
      iconSize: [20, 20],
    });

    return L.marker([lat, lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(popupContent);
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
