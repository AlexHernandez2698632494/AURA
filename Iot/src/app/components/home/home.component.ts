import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FiwareService } from '../../services/fiware/fiware.service';  // Asegúrate de tener la ruta correcta
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../side/side.component';
import { NavComponent } from '../nav/nav.component';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideComponent, NavComponent,CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  title = 'Home';
  subservices: any[] = [];  // Aquí guardamos los subservicios de la API
  private map: L.Map | undefined;  // Mapa de Leaflet
  private currentLocation: [number, number] = [13.7942, -88.8965]; // Ubicación predeterminada (lat, lng)
  private currentZoom: number = 7;  // Zoom predeterminado

  constructor(private fiwareService: FiwareService) {}

  ngAfterViewInit(): void {
    this.initializeIcons();  // Inicializamos los iconos
    this.loadSubServices();  // Cargamos los subservicios
    this.initializeMap();  // Inicializamos el mapa

    // Aseguramos que el tamaño del mapa se ajuste al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
      if (this.map) {  // Chequeo de seguridad para asegurarse de que 'this.map' no sea undefined
        this.map.invalidateSize();
      }
    });
  }

  // Cargar los subservicios desde el servicio
  loadSubServices(): void {
    this.fiwareService.getSubServices().subscribe(
      (data) => {
        this.subservices = data;
        console.log('Subservicios cargados:', this.subservices);
      },
      (error) => {
        console.error('Error al cargar los subservicios:', error);
      }
    );
  }

  // Inicializar los iconos de los marcadores
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

  // Inicializar el mapa de Leaflet
  private initializeMap(): void {
    if (!this.map) {
      this.map = L.map('map', {
        zoomControl: false, // Desactivamos el control de zoom
      }).setView(this.currentLocation, this.currentZoom); // Inicializamos el mapa con el tipo correcto de coordenadas

      // Cargamos las capas del mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Forzamos la actualización del tamaño del mapa
      setTimeout(() => {
        if (this.map) {  // Chequeo de seguridad aquí también
          this.map.invalidateSize();
        }
      }, 0);
    }
  }

  // Cuando el usuario cambia de ubicación en el selector
  onLocationChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedSubservice = selectElement.value;
  
    // Buscamos el subservicio en el array de subservicios
    const subservice = this.subservices.find(service => service.subservice === selectedSubservice);
    
    // Verificamos si el subservicio existe y tiene latitud y longitud válidas
    if (subservice && subservice.latitude != null && subservice.longitude != null) {
      const newLocation: [number, number] = [subservice.latitude, subservice.longitude];
      const newZoom = 17;  // Puedes ajustar el zoom aquí
  
      // Actualizamos la vista del mapa y agregamos un marcador
      if (this.map) {
        this.map.setView(newLocation, newZoom);  // Aseguramos que se pase correctamente el LatLng
        L.marker(newLocation).addTo(this.map).openPopup();
      }
    } else {
      // En caso de que no se haya encontrado o no haya latitud/longitud, muestra un mensaje de error
      console.error('Coordenadas no válidas para el subservicio:', selectedSubservice);
    }
  }
  
  ngOnDestroy(): void {
    // Limpiar los event listeners
    window.removeEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
  }
}
