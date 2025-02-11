import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../side/side.component';
import { NavComponent } from '../nav/nav.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SideComponent, NavComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  title = 'Home';

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
    this.initializeIcons();
    this.initializeMap();

    // Forzar actualización del tamaño del mapa cuando la ventana cambie de tamaño
    window.addEventListener('resize', () => {
      console.log('Redimensionando mapa...');
      if (this.map) {
        this.map.invalidateSize();
      }
    });
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
        attribution: '&copy; <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSpOxpG4Hy_wDmvTHwle-asB2c1SvEsJv84g&s" alt="IIIE" Width="30px"> <a href="https://www.openstreetmap.org/copyright">IIIE</a> <hr>Instituto de Investigación e Innovación en Electronica'
      }).addTo(this.map);
  
      // Forzar actualización del tamaño del mapa después de la inicialización
      setTimeout(() => {
        this.map?.invalidateSize();
        console.log('Tamaño del mapa actualizado.');
      }, 0);
    }
  }

  onLocationChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const location = selectElement.value;

    let newLocation = this.campusLocations.default; // Por defecto: El Salvador

    if (location === 'antiguo') {
      newLocation = this.campusLocations.antiguo;
    } else if (location === 'soyapango') {
      newLocation = this.campusLocations.soyapango;
    } else if (location === 'default') {
      newLocation = this.campusLocations.default; // Vuelve a las coordenadas de El Salvador
    }

    if (this.map) {
      this.map.setView(newLocation.coords, newLocation.zoom);
      L.marker(newLocation.coords).addTo(this.map).openPopup();
    } else {
      this.initializeMap(newLocation);
    }
  }

  ngOnDestroy(): void {
    // Eliminar el listener cuando se destruya el componente
    window.removeEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
  }
}
