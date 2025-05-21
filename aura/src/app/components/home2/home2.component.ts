import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FiwareService } from '../../services/fiware/fiware.service';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ NavComponent, CommonModule],
  templateUrl: './home2.component.html',
  styleUrls: ['./home2.component.css'],
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
    } else {
      // Si existe el servicio, aseguramos que `fiware-servicepath` se reinicie a "/#"
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
  
    // Guardar el subservicio seleccionado en sessionStorage como fiware-servicepath
    sessionStorage.setItem('fiware-servicepath', selectedSubservice);
  
    // Cargar las entidades después de que se ha actualizado el subservicio
    this.loadEntitiesWithAlerts(); // Recargar las entidades con el nuevo subservicio seleccionado
  }

  private loadEntitiesWithAlerts(): void {
    const fiwareService = sessionStorage.getItem('fiware-service') || '';
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath') || '';
  
    let minLat: number = Infinity;
    let maxLat: number = -Infinity;
    let minLng: number = Infinity;
    let maxLng: number = -Infinity;
  
    this.fiwareService.getEntitiesWithAlerts(fiwareService, fiwareServicePath)
      .subscribe((entities) => {
        console.log('Entidades con alertas:', entities);  // Muestra todas las entidades en consola
  
        // Limpia cualquier marcador previo
        this.map?.eachLayer(layer => {
          if (layer instanceof L.Marker) {
            this.map!.removeLayer(layer);
          }
        });
  
        entities.forEach((entity: any) => {
          if (entity.location && entity.location.value && entity.location.value.coordinates) {
            const [latitude, longitude] = entity.location.value.coordinates;
  
            // Actualizamos el bounding box con las coordenadas de esta entidad
            minLat = Math.min(minLat, latitude);
            maxLat = Math.max(maxLat, latitude);
            minLng = Math.min(minLng, longitude);
            maxLng = Math.max(maxLng, longitude);
  
            // Añadimos el marcador con el color de la entidad
            this.addColoredMarker(latitude, longitude, entity.color, entity.displayName, entity.type, entity.variables);
          }
        });
  
        // Ajustamos el mapa al bounding box de todas las entidades
        if (this.map) {
          const bounds = L.latLngBounds(
            [minLat, minLng],  // Coordenada inferior izquierda
            [maxLat, maxLng]   // Coordenada superior derecha
          );
          this.map.fitBounds(bounds);
        }
      }, (error) => {
        console.error('Error al obtener entidades:', error);
      });
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
  