import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentUserService } from '../../../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../../../side/side.component';
import { BottomTabComponent } from '../../../../bottom-tab/bottom-tab.component';
import Swal from 'sweetalert2';
import * as L from 'leaflet';  // Importa Leaflet
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-device',
  standalone: true,
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    CommonModule,
    PremiumSideComponent,
    BottomTabComponent,
    MatButtonModule, MatTooltipModule
  ],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit, AfterViewInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true;
  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  sensorForm: FormGroup;

  // Variables para Leaflet
  map: L.Map | undefined;
  marker: L.Marker | undefined;
  lat: number = 0;
  lon: number = 0;
  mapInitialized = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sensorService: PaymentUserService,
  ) {
    this.sensorForm = this.fb.group({
      sensorType: ['jsonMqtt', Validators.required],  // Valor por defecto
      deviceId: ['', Validators.required],
      name: ['', Validators.required],
      entityType: ['', Validators.required],
      timezone: [this.getTimezone(), Validators.required],
      transporte: ['', Validators.required],  // Validación para 'transporte'
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
    });    
  }

  ngOnInit(): void {
    this.sensorForm.get('latitud')?.valueChanges.subscribe((lat) => {
      const lon = this.sensorForm.get('longitud')?.value;
      if (lat && lon) {
        this.updateMapView(lat, lon);
      }
    });

    this.sensorForm.get('longitud')?.valueChanges.subscribe((lon) => {
      const lat = this.sensorForm.get('latitud')?.value;
      if (lat && lon) {
        this.updateMapView(lat, lon);
      }
    });

    // Suscripción para habilitar/deshabilitar el botón de acuerdo al tipo de sensor y validación
    this.sensorForm.valueChanges.subscribe(() => {
      this.updateButtonState();
    });
  }

  // Obtener la zona horaria del sistema
  getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;  // Ej: "America/New_York"
  }

  ngAfterViewInit(): void {
    this.initializeMap(); // Llamar al método para inicializar el mapa
  }

  // Variable para controlar la habilitación del botón
  isButtonEnabled: boolean | undefined = false;
  // Función para registrar el sensor
  registerSensor(): void {
    if (this.sensorForm.valid) {
      const formData = this.sensorForm.value;
  
      // Asegúrate de que 'transporte' tenga el valor correcto
      const transporte = formData.sensorType === 'jsonMqtt' ? 'MQTT' : 'HTTP';
  
      // Crear la estructura final de datos a enviar
      const requestData = {
        apikey: formData.entityType,
        deviceId: formData.deviceId,
        timezone: this.getTimezone(),
        transporte: transporte,  // Asignar valor de transporte aquí
        locacion: [formData.latitud, formData.longitud],
        deviceName: formData.name
      };
  
      // Mostrar los datos con SweetAlert2
      Swal.fire({
        title: 'Datos a registrar',
        html: `
          <strong>apikey:</strong> ${requestData.apikey} <br>
          <strong>deviceId:</strong> ${requestData.deviceId} <br>
          <strong>timezone:</strong> ${requestData.timezone} <br>
          <strong>transporte:</strong> ${requestData.transporte} <br>
          <strong>Locación:</strong> [${requestData.locacion.join(', ')}] <br>
          <strong>deviceName:</strong> ${requestData.deviceName}
        `,
        icon: 'info',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,  // Mostrar el botón de cancelación
        reverseButtons: true,   // Revertir el orden de los botones (Confirmar a la izquierda)
      }).then((result) => {
        if (result.isConfirmed) {
          // Si se confirma, enviar los datos al servidor
          this.sensorService.registerSerivceDevice(requestData).subscribe(response => {
            // Mostrar un mensaje de éxito
            Swal.fire('Éxito', 'Dispositivo registrado correctamente', 'success');
          }, error => {
            // Mostrar un mensaje de error si ocurre algún problema
            Swal.fire('Error', 'Hubo un error al registrar el dispositivo', 'error');
          });
        } else if (result.isDismissed) {
          // Si se cancela, puedes hacer alguna acción si es necesario
          console.log('Registro cancelado');
        }
      });
    } else {
      Swal.fire('Error', 'Por favor, completa el formulario correctamente.', 'error');
    }
  }
          
  // Navegar hacia atrás
  onBackClick(): void {
    this.router.navigate(['/sensors/index']);
  }

  // Método para inicializar el mapa
  initializeMap(): void {
    if (this.mapInitialized) return; // No lo inicialices si ya está inicializado

    // Intenta obtener la ubicación del usuario, si no se puede, utiliza coordenadas predeterminadas.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
          this.setMapView(this.lat, this.lon, 15);
        },
        (error) => {
          console.error('Error al obtener la ubicación', error);
          this.setMapView(13.7942, -88.8965, 5); // Coordenadas por defecto
        }
      );
    } else {
      console.warn('Geolocalización no soportada');
      this.setMapView(13.7942, -88.8965, 5); // Coordenadas por defecto
    }

    this.mapInitialized = true; // Marca el mapa como inicializado
  }

  // Función para actualizar la vista del mapa y el marcador
  updateMapView(lat: number, lon: number): void {
    if (!this.map) {
      this.initializeMap(); // Si el mapa no está inicializado, lo inicializamos
    } else {
      this.map.setView([lat, lon], 15); // Cambiar el centro del mapa según las coordenadas
      if (this.marker) {
        this.marker.setLatLng([lat, lon]); // Mover el marcador si ya está inicializado
      }
    }
  }

  // Función para configurar la vista del mapa
  setMapView(lat: number, lon: number, zoomLevel: number): void {
    if (this.map) {
      this.map.setView([lat, lon], zoomLevel);
      if (this.marker) {
        this.marker.setLatLng([lat, lon]);
      }
    } else {
      this.map = L.map('map').setView([lat, lon], zoomLevel);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      const iconRetinaUrl = 'assets/images/marker-icon-2x.png';
      const iconUrl = 'assets/images/marker-icon.png';
      const shadowUrl = 'assets/images/marker-shadow.png';

      const markerIcon = L.icon({
        iconUrl: iconUrl,
        iconRetinaUrl: iconRetinaUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: shadowUrl,
        shadowSize: [41, 41],
      });

      this.marker = L.marker([lat, lon], { icon: markerIcon, draggable: true }).addTo(this.map);

      // Evento para actualizar inputs al mover el marcador
      this.marker.on('dragend', (event: any) => {
        const latLng = event.target.getLatLng();
        this.sensorForm.patchValue({
          latitud: latLng.lat,
          longitud: latLng.lng,
        });
      });

      // Evento para actualizar inputs al hacer clic en el mapa
      this.map.on('click', (event: L.LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        this.sensorForm.patchValue({
          latitud: lat,
          longitud: lng,
        });
        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        } else {
          this.marker = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(this.map!);
        }
      });
    }
  }

  // Función para habilitar o deshabilitar el botón de acuerdo con las validaciones
  updateButtonState(): void {
    const sensorType = this.sensorForm.get('sensorType')?.value;
    const isRequiredFieldsFilled = this.sensorForm.get('deviceId')?.valid &&
                                   this.sensorForm.get('name')?.valid &&
                                   this.sensorForm.get('entityType')?.valid &&
                                   this.sensorForm.get('latitud')?.valid &&
                                   this.sensorForm.get('longitud')?.valid;
    
    // Asegurarse de que se asigna un valor booleano (true o false)
    this.isButtonEnabled = (sensorType === 'jsonMqtt' || sensorType === 'jsonHttp') && isRequiredFieldsFilled;
  }
  
}
