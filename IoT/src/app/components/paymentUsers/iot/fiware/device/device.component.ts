import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentUserService } from '../../../../../services/paymentUser/payment-user.service';
import { ApiConfigService } from '../../../../../services/ApiConfig/api-config.service';
import { PremiumSideComponent } from '../../../side/side.component';
import { BottomTabComponent } from '../../../../bottom-tab/bottom-tab.component';
import Swal from 'sweetalert2';
import * as L from 'leaflet';
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
    MatButtonModule,
    MatTooltipModule
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

  map: L.Map | undefined;
  marker: L.Marker | undefined;
  lat: number = 0;
  lon: number = 0;
  mapInitialized = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sensorService: PaymentUserService,
    private apiConfig:ApiConfigService
  ) {
    this.sensorForm = this.fb.group({
      sensorType: ['jsonMqtt', Validators.required],
      deviceId: ['', Validators.required],
      name: ['', Validators.required],
      entityType: ['', Validators.required],
      timezone: [this.getTimezone(), Validators.required],
      transporte: ['jsonMqtt', Validators.required], // Valor por defecto igual que sensorType
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      description:['',Validators.required],
      host: [''],
      protocol: [''],
      port: [''],
      user: [''],
      password: [''],
      provider: [''],
      keepAlive: [''],
      devEui: [''],
      appEui: [''],
      applicationId: [''],
      applicationKey: [''],
      dataModel: ['']
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

    this.sensorForm.valueChanges.subscribe(() => {
      this.updateButtonState();
    });

    // Sincronizar sensorType con transporte
    this.sensorForm.get('transporte')?.valueChanges.subscribe(value => {
      this.sensorForm.patchValue({ sensorType: value }, { emitEvent: false });
    });


  }

  getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  isButtonEnabled: boolean | undefined = false;

  registerSensor(): void {
    if (this.sensorForm.valid) {
      const formData = this.sensorForm.value;

      let transporte = '';
      switch (formData.transporte) {
        case 'jsonMqtt':
          transporte = 'MQTT';
          break;
        case 'jsonHttp':
          transporte = 'HTTP';
          break;
        case 'lorawanMqtt':
          transporte = 'LORA';
          break;
        default:
          transporte = 'DESCONOCIDO';
      }
      let url_socket = `${this.apiConfig.getApiUrl()}/v1/notify`
      let url_quantumleap = `${this.apiConfig.getApiUrl()}/v2/notify`
      const requestData = {
        apikey: formData.entityType,
        deviceId: formData.deviceId,
        timezone: this.getTimezone(),
        transporte: transporte,
        locacion: [formData.latitud, formData.longitud],
        deviceName: formData.name,
        deviceType: "Building",
        url_notify:url_socket,
        url_notify02:url_quantumleap,
        description:formData.description
      };

      Swal.fire({
        title: 'Datos a registrar',
        html: `
      <strong>apikey:</strong> ${requestData.apikey} <br>
      <strong>deviceId:</strong> ${requestData.deviceId} <br>
      <strong>timezone:</strong> ${requestData.timezone} <br>
      <strong>transporte:</strong> ${requestData.transporte} <br>
      <strong>Locación:</strong> [${requestData.locacion.join(', ')}] <br>
      <strong>deviceName:</strong> ${requestData.deviceName} <br>
      <strong>Descripcion:</strong> ${requestData.description} <br>
    `,
        icon: 'info',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.sensorService.registerSerivceDevice(requestData).subscribe(response => {
            Swal.fire('Éxito', 'Dispositivo registrado correctamente', 'success');
          }, error => {
            Swal.fire('Error', 'Hubo un error al registrar el dispositivo', 'error');
          });
        } else if (result.isDismissed) {
          console.log('Registro cancelado');
        }
      });
    } else {
      Swal.fire('Error', 'Por favor, completa el formulario correctamente.', 'error');
    }


  }

  onBackClick(): void {
    this.router.navigate(['/sensors/index']);
  }

  initializeMap(): void {
    if (this.mapInitialized) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lat = position.coords.latitude;
          this.lon = position.coords.longitude;
          this.setMapView(this.lat, this.lon, 15);
        },
        (error) => {
          console.error('Error al obtener la ubicación', error);
          this.setMapView(13.7942, -88.8965, 5);
        }
      );
    } else {
      console.warn('Geolocalización no soportada');
      this.setMapView(13.7942, -88.8965, 5);
    }

    this.mapInitialized = true;


  }

  updateMapView(lat: number, lon: number): void {
    if (!this.map) {
      this.initializeMap();
    } else {
      this.map.setView([lat, lon], 15);
      if (this.marker) {
        this.marker.setLatLng([lat, lon]);
      }
    }
  }

  setMapView(lat: number, lon: number, zoomLevel: number): void {
    if (this.map) {
      this.map.setView([lat, lon], zoomLevel);
      if (this.marker) {
        this.marker.setLatLng([lat, lon]);
      }
    } else {
      this.map = L.map('map').setView([lat, lon], zoomLevel);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

      this.marker.on('dragend', (event: any) => {
        const latLng = event.target.getLatLng();
        this.sensorForm.patchValue({
          latitud: latLng.lat,
          longitud: latLng.lng,
        });
      });

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

  updateButtonState(): void {
    const sensorType = this.sensorForm.get('sensorType')?.value;
  
    const baseFieldsValid = this.sensorForm.get('deviceId')?.valid &&
      this.sensorForm.get('name')?.valid &&
      this.sensorForm.get('entityType')?.valid &&
      this.sensorForm.get('latitud')?.valid &&
      this.sensorForm.get('longitud')?.valid;
  
    let extraValidation = true;
  
    // Validar campo adicional 'description' solo para jsonMqtt
    if (sensorType === 'jsonMqtt') {
      extraValidation = this.sensorForm.get('description')?.valid || false;
    }
  
    this.isButtonEnabled = (sensorType === 'jsonMqtt' || sensorType === 'jsonHttp' || sensorType === 'lorawanMqtt')
      && baseFieldsValid && extraValidation;
  }
  }