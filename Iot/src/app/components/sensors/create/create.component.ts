import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin/admin.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-create-sensor',
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
    RouterOutlet,
    SideComponent,
    BottomTabComponent,
    MatButtonModule
  ],
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateSensorsComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true
  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
  sensorForm: FormGroup;
  availableAuthorities: any[] = [];
  selectedAuthorities: any[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  paths = ['Path1', 'Path2', 'Path3'];
  services = ['Service1', 'Service2', 'Service3'];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sensorService: AdminService
  ) {
    this.sensorForm = this.fb.group({
      sensorType: ['', Validators.required],
      deviceId: ['', Validators.required],
      name: ['', Validators.required],
      entityType: ['', Validators.required],
      timezone: ['', Validators.required],
      path: ['', Validators.required],
      service: ['', Validators.required],
      protocol: ['', Validators.required],
      coordinates: ['', Validators.required],
      // LoraWAN fields
      host: [''],
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
    });
  }

  ngOnInit(): void {
    this.sensorForm.get('sensorType')?.valueChanges.subscribe((value) => {
      this.updateValidators(value); // Actualizar validadores al cambiar el tipo de sensor
    });

    this.sensorService.getAuthorities().subscribe(
      (authorities) => {
        this.availableAuthorities = authorities;
      },
      (error) => {
        console.error('Error al obtener autoridades', error);
        Swal.fire('Error', 'No se pudieron cargar las autoridades', 'error');
      }
    );
  }

  // Función que actualiza los validadores según el tipo de sensor seleccionado
  updateValidators(sensorType: string): void {
    this.resetValidators();

    if (sensorType === 'jsonMqtt') {
      this.sensorForm.get('path')?.setValidators([Validators.required]);
      this.sensorForm.get('service')?.setValidators([Validators.required]);
    } else if (sensorType === 'lorawanMqtt') {
      this.sensorForm.get('path')?.setValidators([Validators.required]);
      this.sensorForm.get('host')?.setValidators([Validators.required]);
      this.sensorForm.get('user')?.setValidators([Validators.required]);
      this.sensorForm.get('password')?.setValidators([Validators.required]);
      this.sensorForm.get('devEui')?.setValidators([Validators.required]);
      this.sensorForm.get('applicationId')?.setValidators([Validators.required]);
      this.sensorForm.get('applicationKey')?.setValidators([Validators.required]);
    } else if (sensorType === 'jsonHttp') {
      this.sensorForm.get('path')?.setValidators([Validators.required]);
      this.sensorForm.get('service')?.setValidators([Validators.required]);
      this.sensorForm.get('protocol')?.setValidators([Validators.required]);
    }

    this.sensorForm.updateValueAndValidity(); // Actualiza el estado del formulario
  }

  // Resetear los validadores de los campos que no son necesarios según el tipo de sensor
  resetValidators(): void {
    const controlsToReset = [
      'path',
      'service',
      'protocol',
      'host',
      'user',
      'password',
      'devEui',
      'appEui',
      'applicationId',
      'applicationKey',
      'dataModel',
    ];

    controlsToReset.forEach((control) => {
      this.sensorForm.get(control)?.clearValidators();
      this.sensorForm.get(control)?.updateValueAndValidity();
    });
  }

  // Función para registrar el sensor
  registerSensor(): void {
    if (this.sensorForm.valid) {
      const formData = this.sensorForm.value;
      console.log('Formulario enviado:', formData);
    } else {
      Swal.fire('Error', 'Completa el formulario correctamente', 'error');
    }
  }

  // Navegar hacia atrás
  onBackClick(): void {
    this.router.navigate(['/sensors/index']);
  }
}
