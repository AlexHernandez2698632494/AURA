import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FiwareService } from '../../services/fiware/fiware.service';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import * as L from 'leaflet';
import Swal from 'sweetalert2';  // Importar SweetAlert2
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ NavComponent, CommonModule],
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
    if (!sessionStorage.getItem('fiware-service') && !sessionStorage.getItem('fiware-servicepath')) {
      sessionStorage.setItem('fiware-service', 'sv');
      sessionStorage.setItem('fiware-servicepath', '/#');
    }
  
    this.initializeIcons();
    this.initializeMap();
  
    window.addEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
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

  // Método que maneja el cambio de selección en el selector
  onLocationChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    // Muestra el Swal con el valor seleccionado
    Swal.fire({
      title: 'Opción seleccionada',
      text: `Se ha seleccionado la opción: ${selectedValue}`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
  }
}
