import {
  Component,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

import { PremiumSideComponent } from '../../../../../../../side/side.component';
import { BottomTabComponent } from '../../../../../../../../bottom-tab/bottom-tab.component';
import { FiwareService } from '../../../../../../../../../services/fiware/fiware.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    PremiumSideComponent,
    BottomTabComponent,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
})
export class CreateConditionComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;
  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  deviceName: string = '';
  command: string = '';
  idActuador: string = '';

  entities: any[] = [];
  deviceForm: FormGroup;
  commandForm: FormGroup;
  showCommandForm = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiwareService: FiwareService
  ) {
    this.deviceForm = this.fb.group({
      numDevices: [[Validators.required, Validators.min(1)]],
      devices: this.fb.array([]),
    });

    this.commandForm = this.fb.group({
      matchType: ['all', Validators.required],
      deviceName: ['', Validators.required],
      command: ['', Validators.required],
      param1: ['', Validators.required],
      param2: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
      this.deviceName = params.get('deviceName') || '';
      this.command = params.get('idActuador') || '';

      this.commandForm.patchValue({
        deviceName: this.deviceName,
        command: this.command,
      });

      // ✅ Solución: intenta obtener el id del actuador de FiwareService, si no, usa el id de la URL
      this.idActuador = this.fiwareService.getIdActuador();
    });

    this.fiwareService.getEntities().subscribe(
      (data) => {
        this.entities = data.filter((entity: any) => {
          const isSensorActuadorValue = entity.isSensorActuador?.value;
          return isSensorActuadorValue === 0 || isSensorActuadorValue === 2;
        });
      },
      (error) => {
        console.error('Error al obtener entidades', error);
      }
    );

    this.deviceForm.get('numDevices')?.valueChanges.subscribe((val) => {
      this.setDeviceControls(val);
      this.showCommandForm = val > 0;
    });

    this.setDeviceControls(this.deviceForm.get('numDevices')?.value || 1);

    this.commandForm.valueChanges.subscribe(() => {
      // fuerza la detección de cambios
    });
  }

  get commandType(): string {
    return this.command.replace(/[0-9]/g, '');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  onBackClick(): void {
    this.router.navigate([
      `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}`,
    ]);
  }

  get devices(): FormArray {
    return this.deviceForm.get('devices') as FormArray;
  }

  setDeviceControls(count: number) {
    while (this.devices.length < count) {
      this.devices.push(this.createDeviceGroup());
    }
    while (this.devices.length > count) {
      this.devices.removeAt(this.devices.length - 1);
    }
  }

  createDeviceGroup(): FormGroup {
    return this.fb.group({
      entityId: ['', Validators.required],
      variable: ['', Validators.required],
      operator: ['>', Validators.required],
      value: ['', Validators.required],
      rangeStart: [''],
      rangeEnd: [''],
    });
  }

  getEntityVariables(entityId: string): string[] {
    const entity = this.entities.find((e) => e.id === entityId);
    return entity ? Object.keys(entity.sensors || {}) : [];
  }

  canRegister(): boolean {
    if (!this.deviceForm.valid) return false;

    for (let i = 0; i < this.devices.length; i++) {
      const deviceGroup = this.devices.at(i);
      if (deviceGroup.get('operator')?.value === 'entre') {
        if (
          !deviceGroup.get('rangeStart')?.value ||
          !deviceGroup.get('rangeEnd')?.value
        ) {
          return false;
        }
      } else {
        if (!deviceGroup.get('value')?.value) return false;
      }
      if (
        !deviceGroup.get('entityId')?.valid ||
        !deviceGroup.get('variable')?.valid ||
        !deviceGroup.get('operator')?.valid
      )
        return false;
    }

    if (!this.commandForm.valid) return false;

    return true;
  }

  onRegisterCondition(): void {
    if (!this.canRegister()) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    const operatorMap: any = {
      '>': 'greater',
      '<': 'less',
      '=': 'equal',
      'entre': 'between',
    };

    const conditionPayload = {
      conditions: this.devices.value.map((device: any) => {
        const condition: any = {
          sensorEntityId: device.entityId,
          sensorAttribute: device.variable,
          conditionType: operatorMap[device.operator],
        };

        if (device.operator === 'entre') {
          condition.value = [
            Number(device.rangeStart),
            Number(device.rangeEnd),
          ];
        } else {
          condition.value = Number(device.value);
        }

        return condition;
      }),
      conditionLogic: this.commandForm.value.matchType === 'all' ? 'AND' : 'OR',
      actuatorEntityId: this.idActuador,
      command: this.commandForm.value.command,
      commandValue: [
        this.commandForm.value.param1,
        this.commandForm.value.param2,
      ],
      enabled: true,
    };

    // 🐞 Debug log
    console.log('Payload enviado:', conditionPayload);

    this.fiwareService.createRule(conditionPayload).subscribe(
      (response) => {
        Swal.fire('Éxito', 'Condición registrada correctamente', 'success');
        this.router.navigate([
          `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}`,
        ]);
      },
      (error) => {
        Swal.fire('Error', 'No se pudo registrar la condición', 'error');
        console.error('Error creando la regla:', error);
      }
    );
  }
}
