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
  imports: [NavComponent, CommonModule],
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
// Método que maneja el cambio de selección en el selector
onLocationChange(event: Event): void {
  const selectedValue = (event.target as HTMLSelectElement).value;

  // Guardar en sessionStorage dependiendo de la selección
  if (selectedValue === 'monitoreo') {
    // Si se selecciona Monitoreo, limpiamos las opciones actuales y mostramos las nuevas opciones
    this.updateLocationSelectForMonitoreo();
  } else {
    // Aquí actualizamos el sessionStorage dependiendo de la fuente de los subservicios
    const fiwareService = sessionStorage.getItem('fiware-service') || 'sv'; // Establece el servicio por defecto
    const token = sessionStorage.getItem('token') || localStorage.getItem('token'); // Obtener el token

    if (token) {
      // Si se usa getSubServiceBuilding, guardamos los dos valores
      sessionStorage.setItem('fiware-servicepath', selectedValue);
      sessionStorage.setItem('fiware-service-building', selectedValue);
      console.log('Subservicio de building seleccionado:', selectedValue);
    } else {
      // Si no hay token y se usa getSubServices, solo guardamos fiware-servicepath
      sessionStorage.setItem('fiware-servicepath', selectedValue);
      console.log('Subservicio de path seleccionado:', selectedValue);
    }

    // Mostrar el mensaje de confirmación
    Swal.fire({
      title: 'Opción seleccionada',
      text: `Se ha seleccionado la opción: ${selectedValue}`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }
}

// Método que actualiza el selector para mostrar las opciones de Monitoreo
updateLocationSelectForMonitoreo(): void {
  const fiwareService = sessionStorage.getItem('fiware-service') || 'sv'; // Establece el servicio por defecto
  const selectElement = document.getElementById('location') as HTMLSelectElement;
  
  // Obtener el valor seleccionado antes de borrar las opciones
  const currentSelectedValue = selectElement.value; 

  // Aseguramos que la opción "/#" esté siempre presente en el select
  let hashOption = selectElement.querySelector('option[value="/#"]') as HTMLOptionElement;
  
  // Si no existe la opción "/#", la agregamos
  if (!hashOption) {
    hashOption = document.createElement('option');
    hashOption.value = '/#';
    hashOption.text = '/#';
    selectElement.appendChild(hashOption);
  }

  // Volver a marcarla como seleccionada si es el valor actual
  hashOption.selected = (currentSelectedValue === '/#');

  // Limpiar las otras opciones del select, pero sin eliminar "/#"
  const otherOptions = selectElement.querySelectorAll('option:not([value="/#"])');
  otherOptions.forEach(option => option.remove());

  const token = sessionStorage.getItem('token') || localStorage.getItem('token'); // Obtener el token
  
  // Si el token existe, cargamos los subservicios de getSubServiceBuilding
  if (token) {
    console.log('Cargando subservicios con el token...');

    this.fiwareService.getSubServiceBuilding(fiwareService).subscribe((subservices) => {
      console.log('Subservicios recibidos de getSubServiceBuilding:', subservices);
      
      if (subservices && subservices.length > 0) {
        subservices.forEach((subservice: any) => {
          if (subservice && subservice.subservice) {
            const option = document.createElement('option');
            option.value = subservice.subservice;
            option.text = subservice.name;
            selectElement.appendChild(option);
          } else {
            console.log('Subservicio inválido:', subservice);
          }
        });
      } else {
        console.log('No se recibieron subservicios de getSubServiceBuilding');
      }
    });
  } else {
    console.log('Token no encontrado, cargando subservicios de getSubServices...');
    
    // Si no hay token, obtenemos los subservicios de getSubServices
    this.fiwareService.getSubServices(fiwareService).subscribe((subservices) => {
      console.log('Subservicios recibidos de getSubServices:', subservices);
      
      if (subservices && subservices.length > 0) {
        subservices.forEach((subservice: string) => {
          if (subservice) {
            const option = document.createElement('option');
            option.value = subservice;
            option.text = subservice;
            selectElement.appendChild(option);
          } else {
            console.log('Subservicio inválido:', subservice);
          }
        });
      } else {
        console.log('No se recibieron subservicios de getSubServices');
      }
    });
  }
}
    
  ngOnDestroy(): void {
    window.removeEventListener('resize', () => {
      if (this.map) {
        this.map.invalidateSize();
      }
    });
  }
}
