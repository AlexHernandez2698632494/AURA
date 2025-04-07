import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { FiwareService } from '../../services/fiware/fiware.service';
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
  buildings: any[] = [];
  private map: L.Map | undefined;
  private currentLocation: [number, number] = [13.7942, -88.8965];
  private currentZoom: number = 7;
  selectedEntity: any = null;
  modalVisible: boolean = false;
  modalPosition: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(private fiwareService: FiwareService) { }

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

  onLocationChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    // Si se selecciona Monitoreo, actualizamos sessionStorage y recargamos las entidades
    if (selectedValue === 'monitoreo') {
      // Establecemos fiware-servicepath como "/#"
      sessionStorage.setItem('fiware-servicepath', '/#');
      // Limpiamos las opciones y cargamos las entidades para monitoreo
      this.loadEntitiesWithAlerts();
      this.updateLocationSelectForMonitoreo(); // Llamamos al método que limpia y actualiza las opciones de monitoreo
    } else {
      // Para otros subservicios
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

      // Cargar entidades con alertas con el subservicio seleccionado
      this.loadEntitiesWithAlerts();
    }
  }

  updateFiwareServicePath(selectedValue: string): void {
    const fiwareService = sessionStorage.getItem('fiware-service') || 'sv';
    sessionStorage.setItem('fiware-servicepath', selectedValue);

    Swal.fire({
      title: 'Opción seleccionada',
      text: `Se ha seleccionado la opción: ${selectedValue}`,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }

  // Método que actualiza el selector para Monitoreo y carga los subservicios correspondientes
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
      console.log('Cargando subservicios con el token (edificios)...');

      this.fiwareService.getSubServiceBuilding(fiwareService).subscribe((subservices) => {
        console.log('Subservicios recibidos de getSubServiceBuilding:', subservices);

        if (subservices && subservices.length > 0) {
          const buildings: any[] = [];

          // Agregar los edificios al mapa
          subservices.forEach((subservice: any) => {
            if (subservice && subservice.subservice) {
              const option = document.createElement('option');
              option.value = subservice.subservice;
              option.text = subservice.name;
              selectElement.appendChild(option);

              // Añadir marcador en el mapa con icono y mostrar la información del edificio
              const location = subservice.location;
              if (location && location.length === 2) {
                const [latitude, longitude] = location;

                // Crear un icono estándar para cada edificio
                const buildingIcon = L.icon({
                  iconUrl: '/assets/images/building-icon.png',
                  iconSize: [32, 32], // Tamaño del icono
                  iconAnchor: [16, 32], // Centro del ícono (ancla en el centro)
                  popupAnchor: [0, -32], // Donde aparecerá el pop-up
                });

                // Crear marcador y añadir al mapa
                const marker = L.marker([latitude, longitude], { icon: buildingIcon })
                  .addTo(this.map!);

                // Almacenar los edificios con su ubicación
                buildings.push({
                  name: subservice.name,
                  location: [latitude, longitude],
                  subservice: subservice.subservice,
                  nivel: subservice.nivel,
                  salones: subservice.salones,  // Añadimos la lista de salones
                  marker
                });

                // Construir el contenido del pop-up
                let popupContent = `<b>${subservice.name}</b><br>
                  <i>Número de plantas: ${subservice.nivel}</i><br>`;

                if (subservice.salones && subservice.salones.length > 0) {
                  // Mostrar los salones de cada planta
                  const nivelesSalones: { [nivel: string]: any[] } = subservice.salones.reduce((acc: { [nivel: string]: any[] }, salon: { nombre: string, nivel: number, subservice: string, enlace: string }) => {
                    if (!acc[salon.nivel]) {
                      acc[salon.nivel] = [];
                    }
                    acc[salon.nivel].push(salon);
                    return acc;
                  }, {});
                  
                  for (let nivel in nivelesSalones) {
                    popupContent += `<hr><b>Planta ${nivel}</b><br>`;
                    nivelesSalones[nivel].forEach((salon: { nombre: string, nivel: number, subservice: string, enlace: string }) => {
                      popupContent += `<a href="${salon.enlace}" target="_blank">${salon.nombre}</a><br>`;
                    });
                  }

                } else {
                  popupContent += '<i>No hay salones disponibles</i>';
                }

                marker.bindPopup(popupContent);
              }
            } else {
              console.log('Subservicio inválido:', subservice);
            }
          });

          // Guardar edificios en el estado
          this.buildings = buildings;

          // Llamada a la función que manejará la selección de un edificio
          this.handleBuildingSelection(selectElement, buildings);
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

  handleBuildingSelection(selectElement: HTMLSelectElement, buildings: any[]): void {
    selectElement.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement; // Asegúrate de que event.target es un HTMLSelectElement

      // Si target es null, retornamos
      if (!target) return;

      const selectedBuilding = target.value; // Ahora podemos acceder al value con seguridad

      if (selectedBuilding === '/#') {
        // Triangular todos los edificios
        this.triangleAllBuildings(buildings);
        return;
      }

      const building = buildings.find((b) => b.subservice === selectedBuilding);

      if (building) {
        // Centrar el mapa en el edificio seleccionado con zoom máximo
        this.map!.setView(building.location, 20); // Zoom 20 para ver el edificio de cerca

        // Mostrar solo ese edificio
        this.showOnlySelectedBuilding(building, buildings);
      }
    });
  }

  triangleAllBuildings(buildings: any[]): void {
    // Centrar el mapa para mostrar todos los edificios
    const locations = buildings.map(b => b.location);
    const bounds = locations.length > 0 ? L.latLngBounds(locations) : null;

    if (bounds) {
      this.map!.fitBounds(bounds, { maxZoom: 18 }); // Ajustar el zoom entre 16 y 18 para ver todos los edificios
    }
  }

  showOnlySelectedBuilding(building: any, buildings: any[]): void {
    // Remover todos los marcadores actuales del mapa
    this.map!.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map!.removeLayer(layer);
      }
    });

    // Mostrar solo el edificio seleccionado
    building.marker.addTo(this.map);
  }

  calculateDistance([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // Distancia en metros
    return distance;
  }

  degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Método que carga las entidades con alertas (igual que en entidadesComponent)
  private loadEntitiesWithAlerts(): void {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token'); // Obtener el token
    const fiwareService = sessionStorage.getItem('fiware-service') || '';
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath') || '';

    if (token) {
      // No cargamos las entidades si existe el token (es decir, se muestran edificios)
      console.log('Token encontrado, no cargamos entidades. Mostrando edificios...');
      return;
    }

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
  // Método para cargar entidades con alertas en el mapa

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
