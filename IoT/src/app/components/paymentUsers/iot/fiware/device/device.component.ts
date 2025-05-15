import { Component, OnInit, HostListener, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';

  // NUEVO: opciones y seleccionados para SENSOR/ACTUADOR
  selectedTypes: string[] = [];
  availableControlTypes: string[] = ['switch', 'dial', 'toggleText', 'analogo'];
  selectedControlTypes: string[] = [];
  controlTypeCounters: { [key: string]: number } = {};

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sensorService: PaymentUserService,
    private apiConfig: ApiConfigService,
    private activatedRoute: ActivatedRoute
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
      description: ['', Validators.required],
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
      dataModel: [''],
      deviceRoles: [[]]
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
    });

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

    // Traducir tipo de transporte
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

    // Calcular isSensorActuador
    let isSensorActuador = 0;
    const roles = this.selectedDeviceRoles;
    if (roles.includes('SENSOR') && roles.includes('ACTUADOR')) {
      isSensorActuador = 2;
    } else if (roles.includes('ACTUADOR')) {
      isSensorActuador = 1;
    }

    // Inicializar arrays para los comandos
    const nameStates: string[] = [];
    const commandName: string[] = [];
    const commandNameToggle: string[] = [];
    const commandNameAnalogo: string[] = [];
    const commandNameDial: string[] = [];
    const commandNameToggleText: string[] = [];

    // Separar comandos según tipo
    this.selectedControlTypes.forEach(control => {
      if (!control || control.trim() === '') return;

      nameStates.push(`${control}_states`);
      commandName.push(control);

      if (control.startsWith('switch')) {
        commandNameToggle.push(control);
      } else if (control.startsWith('analogo')) {
        commandNameAnalogo.push(control);
      } else if (control.startsWith('dial')) {
        commandNameDial.push(control);
      } else if (control.startsWith('toggleText')) {
        commandNameToggleText.push(control);
      }
    });

    // Utilidad para arrays limpios (sin strings vacíos)
    const cleanArray = (arr: string[]) => arr.filter(x => x && x.trim() !== '');

    const url_socket = `${this.apiConfig.getApiUrl()}/v1/notify`;
    const url_quantumleap = `${this.apiConfig.getApiUrlMoquitto()}/v2/notify`;

    const requestData = {
      apikey: formData.entityType,
      deviceId: formData.deviceId,
      timezone: this.getTimezone(),
      transporte: transporte,
      locacion: [
        parseFloat(formData.latitud),
        parseFloat(formData.longitud)
      ],
      deviceName: formData.name,
      deviceType: "Building", // Ajusta si es case sensitive
      url_notify: url_socket,
      url_notify02: url_quantumleap,
      description: formData.description,
      isSensorActuador: isSensorActuador,
      nameStates: cleanArray(nameStates),
      commandName: cleanArray(commandName),
      commandNameToggle: cleanArray(commandNameToggle),
      commandNameAnalogo: cleanArray(commandNameAnalogo),
      commandNameDial: cleanArray(commandNameDial),
      commandNameToggleText: cleanArray(commandNameToggleText)
    };

    Swal.fire({
      title: 'Datos a registrar',
      html: `
        <strong>Apikey:</strong> ${requestData.apikey} <br>
        <strong>DeviceId:</strong> ${requestData.deviceId} <br>
        <strong>Zona Horaria:</strong> ${requestData.timezone} <br>
        <strong>Transporte:</strong> ${requestData.transporte} <br>
        <strong>Locación:</strong> [${requestData.locacion.join(', ')}] <br>
        <strong>Nombre del dispositivo:</strong> ${requestData.deviceName} <br>
        <strong>Descripcion:</strong> ${requestData.description} <br>
        <strong>Categoria del dispositivo:</strong> ${this.selectedDeviceRoles.join(', ')} <br>
        <strong>Tipos de Actuador:</strong> ${requestData.commandName.join(', ')} <br>
      `,
      icon: 'info',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.sensorService.registerSerivceDevice(requestData).subscribe(
          response => {
            Swal.fire('Éxito', 'Dispositivo registrado correctamente', 'success');
          },
          error => {
            Swal.fire('Error', 'Hubo un error al registrar el dispositivo', 'error');
          }
        );
      } else if (result.isDismissed) {
        console.log('Registro cancelado');
      }
    });
  } else {
    Swal.fire('Error', 'Por favor, completa el formulario correctamente.', 'error');
  }
}

  

  onBackClick(): void {
    this.router.navigate(['/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}']);
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
  // NUEVO: Método para remover chips
  removeType(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index >= 0) {
      this.selectedTypes.splice(index, 1);
    }
  }
  availableDeviceRoles: string[] = ['SENSOR', 'ACTUADOR'];
  selectedDeviceRoles: string[] = [];
  onDeviceRoleSelection(event: any): void {
    const value = event.value;
    this.selectedDeviceRoles = value;
    this.sensorForm.patchValue({ deviceRoles: this.selectedDeviceRoles });
  }
  removeDeviceRole(role: string): void {
    this.selectedDeviceRoles = this.selectedDeviceRoles.filter(r => r !== role);
    this.sensorForm.patchValue({ deviceRoles: this.selectedDeviceRoles });
  }

  addControlType(type: string, selectRef?: any): void {
    if (!this.controlTypeCounters[type]) {
      this.controlTypeCounters[type] = 1;
    } else {
      this.controlTypeCounters[type]++;
    }
  
    const newName = `${type}${this.controlTypeCounters[type].toString().padStart(2, '0')}`;
    this.selectedControlTypes.push(newName);
  
    // Resetear el selector para permitir seleccionar el mismo tipo nuevamente
    if (selectRef) {
      selectRef.value = null;
      selectRef.writeValue(null); // Asegura que se limpie visualmente
    }
  }
  

  removeControlType(type: string): void {
    const index = this.selectedControlTypes.indexOf(type);
    if (index >= 0) {
      this.selectedControlTypes.splice(index, 1);
    }
  }
  isActuatorSelected(): boolean {
    return this.selectedDeviceRoles.includes('ACTUADOR');
  }
  
}