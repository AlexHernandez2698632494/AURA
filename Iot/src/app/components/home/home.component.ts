import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FiwareService } from '../../services/fiware/fiware.service';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  title = 'Home';
  subservices: any[] = [];
  private map: L.Map | undefined;
  private currentLocation: [number, number] = [13.7942, -88.8965]; 
  private currentZoom: number = 7;
  selectedEntity: any = null;
  modalVisible: boolean = false;
  modalPosition: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(private fiwareService: FiwareService) {}

  ngAfterViewInit(): void {
    // Verificamos si las claves ya existen en sessionStorage
    if (!sessionStorage.getItem('fiware-service') && !sessionStorage.getItem('fiware-servicepath')) {
      // Si no existen, las creamos con los valores correspondientes
      sessionStorage.setItem('fiware-service', 'sv');
      sessionStorage.setItem('fiware-servicepath', '/#');
    }
  
    this.initializeIcons();
    this.loadSubServices();
    this.initializeMap();
    this.loadEntitiesWithAlerts();
  
    window.addEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
  }
  

  loadSubServices(): void {
    const fiwareService = sessionStorage.getItem('fiware-service');
  
    if (fiwareService) {
      this.fiwareService.getSubServices(fiwareService).subscribe(
        (data) => {
          this.subservices = data;
          console.log('Subservicios cargados:', this.subservices);
        },
        (error) => {
          console.error('Error al cargar los subservicios:', error);
        }
      );
    } else {
      console.error('fiware-service no encontrado en sessionStorage');
    }
  }

  private initializeIcons(): void {
    const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
    const iconUrl = 'assets/images/marker-icon.png';
    const shadowUrl = 'assets/images/marker-shadow.png';

    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  private initializeMap(): void {
    if (!this.map) {
      this.map = L.map('map', { zoomControl: false })
        .setView(this.currentLocation, this.currentZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSpOxpG4Hy_wDmvTHwle-asB2c1SvEsJv84g&s" alt="IIIE" Width="30px"> <a href="" style="font-size:30px;">IIIE</a> <hr>Instituto de Investigación e Innovación en Electronica'
        }).addTo(this.map);
        
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 0);
    }
  }

  onLocationChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedSubservice = selectElement.value;
  
    const subservice = this.subservices.find(service => service.subservice === selectedSubservice);
    
    if (subservice && subservice.latitude != null && subservice.longitude != null) {
      const newLocation: [number, number] = [subservice.latitude, subservice.longitude];
      const newZoom = 17;
  
      if (this.map) {
        this.map.setView(newLocation, newZoom);
        L.marker(newLocation).addTo(this.map).openPopup();
      }
    } else {
      console.error('Coordenadas no válidas para el subservicio:', selectedSubservice);
    }
  }

  private loadEntitiesWithAlerts(): void {
    const fiwareService = sessionStorage.getItem('fiware-service') || '';
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath') || '';
  
    this.fiwareService.getEntitiesWithAlerts(fiwareService, fiwareServicePath)
      .subscribe((entities) => {
        entities.forEach((entity: any) => {
          if (entity.location && entity.location.value && entity.color) {
            const [latitude, longitude] = entity.location.value.coordinates;
            this.addColoredMarker(latitude, longitude, entity.color, entity.displayName, entity.type, entity.variables);
          }
        });
      }, (error) => console.error('Error al obtener entidades:', error));
  }
  
  private addColoredMarker(lat: number, lng: number, color: string, name: string, type: string, variables: any[]): void {
    if (!this.map) return;
  
    let popupContent = `<b>${type}</b><br>`;
    if (variables && variables.length) {
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
  
    L.marker([lat, lng], { icon: customIcon })
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
}
  