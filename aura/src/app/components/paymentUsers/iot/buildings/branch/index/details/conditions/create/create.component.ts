import {
  Component,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
  AfterViewInit,
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
import { PremiumSideComponent } from '../../../../../../../side/side.component';
import { BottomTabComponent } from '../../../../../../../../bottom-tab/bottom-tab.component';

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
  form: FormGroup;
  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  deviceName: string = '';

  entidades = ['Entidad 1', 'Entidad 2', 'Entidad 3'];
  variables = ['Temperatura', 'Presión', 'Humedad'];
  operadores = ['mayor que', 'menor que', 'igual', 'entre', 'función'];
  selectores = ['Se cumplen todas', 'Se cumple al menos una'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      cantidad: [0, [Validators.required, Validators.min(1)]],
      dispositivos: this.fb.array([]),
    });
  }

  private createDispositivoGroup(): FormGroup {
    const group = this.fb.group({
      entidad: [null, Validators.required],
      variable: [null, Validators.required],
      operador: ['mayor que', Validators.required],
      valor: ['', Validators.required],
      valorMinimo: [''],
      valorMaximo: [''],
      comando: ['', Validators.required],
      selector: ['', Validators.required],
      // valorDesactivacion: ['', Validators.required],
    });

    // Validaciones dinámicas según operador
    const operadorControl = group.get('operador');

    operadorControl?.valueChanges.subscribe((op) => {
      if (op === 'entre') {
        group.get('valor')?.setValidators([]);
        group.get('valorMinimo')?.setValidators([Validators.required]);
        group.get('valorMaximo')?.setValidators([Validators.required]);
      } else {
        group.get('valor')?.setValidators([Validators.required]);
        group.get('valorMinimo')?.setValidators([]);
        group.get('valorMaximo')?.setValidators([]);
      }

      group.get('valor')?.updateValueAndValidity({ emitEvent: false });
      group.get('valorMinimo')?.updateValueAndValidity({ emitEvent: false });
      group.get('valorMaximo')?.updateValueAndValidity({ emitEvent: false });
    });

    // Forzar validación con valor inicial
    operadorControl?.setValue(operadorControl.value);

    return group;
  } 


  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
      this.deviceName = params.get('deviceName') || '';
      this.form.statusChanges.subscribe((status) => {
        console.log('Estado del formulario:', status);
        console.log('Formulario completo:', this.form);
      });
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  get dispositivos(): FormArray {
    return this.form.get('dispositivos') as FormArray;
  }

  onCantidadChange(): void {
    const cantidad = this.form.get('cantidad')?.value;

    if (!cantidad || cantidad < 1) {
      this.dispositivos.clear();
      return;
    }

    this.dispositivos.clear();

    for (let i = 0; i < cantidad; i++) {
      const dispositivoGroup = this.createDispositivoGroup();
      this.dispositivos.push(dispositivoGroup);
    }
    this.form.updateValueAndValidity();
  }


  submit(): void {
    console.log(this.form.value);
  }

  onBackClick(): void {
    this.router.navigate([
      `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}`,
    ]);
  }
}
