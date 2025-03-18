import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../../side/side.component';
import { BottomTabComponent } from '../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../services/paymentUser/payment-user.service';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent, MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class BuildingsCreateComponent implements OnInit, AfterViewInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  subscriptionsCount: number = 0;
  subscriptionsList: { name: string; isExpired: boolean }[] = [];
  usersCount: number = 0;
  buildings: any[] = [];
  buildingForm: FormGroup;
  imageName: string = ''; // Variable para almacenar el nombre de la imagen seleccionada
  hasLocationPermission: boolean = false;  // Variable para controlar si se obtuvo permiso de ubicación

  plantas: number[] = [];  // Array to hold plant details (based on "nivel" or number of plants)

  // Latitud y longitud
  lat: number = 0;
  lng: number = 0;
  map: L.Map | undefined;
  marker: L.Marker | undefined;

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.buildingForm = this.fb.group({
      nombre: ['', [Validators.required]],
      numeroPlantas: ['', [Validators.required]],
      imagenPrincipal: [null, [Validators.required]],
      imagenesPlantas: this.fb.array([]), // FormArray para imágenes de plantas
      latitud: ['', [Validators.required]],
      longitud: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadBuildings();
  }

  ngAfterViewInit() {
    this.initMap();
    this.initializeIcons();
  }

  loadBuildings(): void {
    this.paymentUserService.getBuildings().subscribe({
      next: (data) => {
        this.buildings = data;
        console.log('Edificios obtenidos:', this.buildings);
      },
      error: (err) => {
        console.error('Error al obtener los edificios:', err);
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

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  navigateToCreateBuilding(): void {
    this.router.navigate(['/premium/building/create']);
  }

  onBackClick(): void {
    this.router.navigate(['/premium/building']);
  }

  // Este método maneja los cambios cuando se cambia el campo "numeroPlantas".
  onNivelChange(): void {
    const numeroPlantas = this.buildingForm.get('numeroPlantas')?.value;
    this.plantas = Array.from({ length: numeroPlantas }, (_, i) => i + 1);  // Creamos un array basado en el número de plantas
    this.addDynamicControls();  // Añadimos controles dinámicos para cada imagen de planta
  }

  // Añadimos controles dinámicos para las imágenes de plantas basados en el número de plantas
  addDynamicControls() {
    const imagenesPlantasArray = this.buildingForm.get('imagenesPlantas') as FormArray;
    imagenesPlantasArray.clear();  // Limpiamos cualquier control previo

    this.plantas.forEach(() => {
      // Cada planta tendrá un FormGroup con un solo control para la imagen
      imagenesPlantasArray.push(this.fb.group({
        imagenPlanta: [null, Validators.required]
      }));
    });
  }

  registerBuilding(): void {
    
  }
  
  // Método para activar el input file al hacer clic en el botón
  triggerFileInput() {
    const fileInput: HTMLElement = document.getElementById('imagenFile') as HTMLElement;
    fileInput.click();  // Esto hace que se abra el diálogo de selección de archivo
  }

  // Método que maneja la selección de imagen
onImageSelected(event: any) {
  const file = event.target.files[0];  // Obtenemos el primer archivo seleccionado
  if (file) {
    console.log('Imagen seleccionada:', file);
    this.imageName = file.name; // Guardamos el nombre de la imagen seleccionada
    
    // Actualizar el valor del formulario con el nombre de la imagen seleccionada
    this.buildingForm.get('imagenPrincipal')?.setValue(this.imageName);
  }
}

  // Método para activar el input file para la imagen de cada planta
  triggerFileInputPlanta(i: number) {
    const fileInput: HTMLElement = document.getElementById('imagenPlanta' + i + 'File') as HTMLElement;
    fileInput.click();  // Esto hace que se abra el diálogo de selección de archivo
  }

  // Método que maneja la selección de la imagen para cada planta
  onImagePlantaSelected(event: any, i: number): void {
    const file = event.target.files[0];  // Obtenemos el primer archivo seleccionado
    if (file) {
      console.log(`Imagen seleccionada para planta ${i + 1}:`, file);
      (this.buildingForm.get('imagenesPlantas') as FormArray).at(i).get('imagenPlanta')?.setValue(file.name);
    }
  }
  
  // Inicialización del mapa
  initMap() {
    // Coordenadas por defecto de El Salvador
    const defaultLat = 13.7942;
    const defaultLng = -88.8965;

    // Establecer la vista del mapa si no está inicializada aún
    if (!this.map) {
      this.map = L.map('map').setView([this.lat || defaultLat, this.lng || defaultLng], 5);  // Establecemos un zoom de 5 al principio

      // Agregar capa de mapas (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);

      // Manejo del clic en el mapa
      this.map.on('click', (e: L.LeafletEvent) => {
        const latLng = (e as L.LeafletMouseEvent).latlng; // Aseguramos que el evento es de tipo LeafletMouseEvent
        this.lat = latLng.lat;
        this.lng = latLng.lng;
        this.updateCoordinatesInputs(); // Actualiza los inputs de latitud y longitud

        // Solo actualizamos la posición del marcador, sin mover el mapa
        this.updateMarkerPosition(latLng);
      });
    }

    // Obtener la ubicación del navegador y marcarla en el mapa
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.hasLocationPermission = true;  // Si se obtiene la ubicación, actualizamos el permiso
          this.updateMap();  // Actualizamos el mapa con las nuevas coordenadas y zoom adecuado
        },
        (error) => {
          console.warn('No se pudo obtener la ubicación, usando ubicación por defecto.');
          this.lat = defaultLat;
          this.lng = defaultLng;
          this.hasLocationPermission = false;  // Si no se obtiene la ubicación, actualizamos el permiso
          this.updateMap();  // Actualizamos el mapa con las coordenadas predeterminadas y zoom adecuado
        }
      );
    } else {
      // Si el navegador no soporta geolocalización, usamos coordenadas predeterminadas
      console.warn('Geolocalización no soportada, usando ubicación por defecto.');
      this.lat = defaultLat;
      this.lng = defaultLng;
      this.hasLocationPermission = false;  // Si no se puede acceder a la geolocalización, actualizamos el permiso
      this.updateMap();  // Actualizamos el mapa con las coordenadas predeterminadas y zoom adecuado
    }
  }

  // Método para actualizar la posición del marcador sin mover el mapa
  updateMarkerPosition(latLng: L.LatLng) {
    if (this.map) { // Verificar que `this.map` está inicializado
      if (!this.marker) {
        this.marker = L.marker([latLng.lat, latLng.lng]).addTo(this.map); // Si no hay marcador, lo agregamos
      } else {
        this.marker.setLatLng([latLng.lat, latLng.lng]);  // Actualizamos la posición del marcador
      }
    }
  }

  // Actualiza el mapa con la nueva posición
  updateMap() {
    if (this.map) { // Asegurarnos que el mapa esté inicializado
      const zoomLevel = this.hasLocationPermission ? 15 : 5;  // Si se obtuvo el permiso, usar zoom 15, si no, zoom 5
      this.map.setView([this.lat, this.lng], zoomLevel);  // Actualizamos la vista del mapa con el nuevo nivel de zoom
      if (!this.marker) {
        this.marker = L.marker([this.lat, this.lng]).addTo(this.map);
      } else {
        this.marker.setLatLng([this.lat, this.lng]);
      }
    }
  }

  // Actualiza los campos de latitud y longitud
  updateCoordinatesInputs() {
    this.buildingForm.patchValue({
      latitud: this.lat,
      longitud: this.lng
    });
  }

  // Este método se activa cuando se escriben las coordenadas manualmente
  onCoordinatesChange() {
    const lat = parseFloat(this.buildingForm.get('latitud')?.value);
    const lng = parseFloat(this.buildingForm.get('longitud')?.value);
    if (!isNaN(lat) && !isNaN(lng)) {
      this.lat = lat;
      this.lng = lng;
      this.updateMap();
    }
  }
  
}
