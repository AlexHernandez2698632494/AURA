import { Component, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideLoginComponent } from '../side-login/side-login.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideLoginComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit {
  title = 'Home';

  // Coordenadas y zoom de los distintos campus y El Salvador
  private campusLocations = {
    default: {
      coords: [13.7942, -88.8965] as [number, number], // Centro de El Salvador
      zoom: 7, // Zoom más amplio para mostrar El Salvador
    },
    soyapango: {
      coords: [13.7157768, -89.1533539] as [number, number], // Soyapango
      zoom: 17, // Zoom cercano para Soyapango
    },
    antiguo: {
      coords: [13.6741595, -89.2370651] as [number, number], // Antiguo
      zoom: 18, // Zoom cercano para Antiguo
    },
  };

  private map: L.Map | undefined;

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

  ngAfterViewInit(): void {
    this.initializeIcons(); // Asegura que los íconos se inicialicen correctamente
    this.initializeMap();   // Inicializa el mapa con las coordenadas de El Salvador
  }

  private initializeMap(location = this.campusLocations.default): void {
    console.log('Inicializando mapa...');
  
    if (!this.map) {
      this.map = L.map('map', {
        zoomControl: false,
      }).setView(location.coords, location.zoom);
  
      console.log('Mapa creado:', this.map);
  
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);
  
      // Forzar actualización del tamaño del mapa después de la inicialización
      setTimeout(() => {
        this.map?.invalidateSize();
        console.log('Tamaño del mapa actualizado.');
      }, 0);
    }
  }
  
  // Método para actualizar el mapa al seleccionar una ubicación
  onLocationChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const location = selectElement.value;

    let newLocation = this.campusLocations.default; // Por defecto: El Salvador

    // Asigna las coordenadas y zoom de acuerdo a la opción seleccionada
    if (location === 'antiguo') {
      newLocation = this.campusLocations.antiguo;
    } else if (location === 'soyapango') {
      newLocation = this.campusLocations.soyapango;
    } else if (location === 'default') {
      newLocation = this.campusLocations.default; // Vuelve a las coordenadas de El Salvador
    }

    if (this.map) {
      // Cambia el centro del mapa y el zoom
      this.map.setView(newLocation.coords, newLocation.zoom);
      // Cambia el marcador
      L.marker(newLocation.coords).addTo(this.map).openPopup();
    } else {
      // Si el mapa no está inicializado, inicialízalo con las nuevas coordenadas
      this.initializeMap(newLocation);
    }
  }
}
