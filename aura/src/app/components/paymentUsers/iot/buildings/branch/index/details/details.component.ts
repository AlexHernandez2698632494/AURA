import {
  Component,
  OnInit,
  HostListener,
  Output,
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
  AfterViewChecked
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PremiumSideComponent } from '../../../../../side/side.component';
import { BottomTabComponent } from '../../../../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../../../../services/paymentUser/payment-user.service';
import { FiwareService } from '../../../../../../../services/fiware/fiware.service';
import { NgxGaugeModule } from 'ngx-gauge';
import { SocketService } from '../../../../../../../services/socket/socket.service';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

declare var CanvasJS: any;

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, 
    PremiumSideComponent, 
    MatIconModule, 
    BottomTabComponent, 
    NgxGaugeModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule,],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsDeviceComponent implements OnInit, AfterViewChecked {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;

  buildingName: string = '';
  branchName: string = '';
  branchId: string = '';
  entitiesWithAlerts: any[] = [];
  deviceName: string = '';

  variables: any[] = [];
  commands: any[] = [];
private entidadMap: { [id: string]: any } = {};

  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  private chartsRendered = false;

  actuadores: {
    toggle: { label: string }[],
    analogo: any[],
    dial: any[],
    toggleText: any[]
  } = {
    toggle: [],
    analogo: [],
    dial: [],
    toggleText: []
  };
  pastelColor: string = '';
  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiwareService: FiwareService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) { }

// Agrega esto arriba en tu clase para mantener el estado de las entidades
private entidadesMap: { [id: string]: any } = {};

// ngOnInit() {
//   // Obtén los parámetros de la ruta
//   this.activatedRoute.paramMap.subscribe(params => {
//     this.buildingName = params.get('buildingName') || '';
//     this.branchName = params.get('branchName') || '';
//     this.branchId = params.get('id') || '';
//   });

//   // Obtén el nombre del dispositivo desde la URL
//   this.deviceName = this.router.url.split('/').pop() || '';

//   const fiwareService = sessionStorage.getItem('fiware-service');
//   const fiwareServicePath = sessionStorage.getItem('fiware-servicepath');

//   if (fiwareService && fiwareServicePath) {
//     // Subscríbete a las entidades con alertas que llegan desde el WebSocket
//     this.socketService.entitiesWithAlerts$.subscribe((entities: any[]) => {
//       // Verifica los datos que llegan en la suscripción
//       console.log("Device Name recibido:", this.deviceName);
//       console.log("Datos recibidos del socket:", entities); // Muestra las entidades recibidas completas

//       // Actualiza el mapa de entidades con los datos nuevos
//       entities.forEach(entity => {
//         const id = entity.id;
//         const entidadAnterior = this.entidadesMap[id] || {};

//         // Combinar los datos nuevos con los anteriores para no perder commandTypes y commands
//         this.entidadesMap[id] = {
//           ...entidadAnterior,
//           ...entity,
//           commands: (entity.commands && entity.commands.length > 0) ? entity.commands : entidadAnterior.commands,
//           commandTypes: entity.commandTypes ? entity.commandTypes : entidadAnterior.commandTypes
//         };
//       });

//       // Filtra por deviceName como antes, pero desde el mapa actualizado
//       const todasLasEntidades = Object.values(this.entidadesMap);
//       this.entitiesWithAlerts = todasLasEntidades.filter(entity => {
//         const entityDeviceName = entity.deviceName || (entity.raw && entity.raw.deviceName);
//         return entityDeviceName === this.deviceName;
//       });

//       // Verifica el resultado del filtro
//       console.log("Entidad filtrada:", this.entitiesWithAlerts);

//       // Si se encuentra la entidad, procesa los comandos y las reglas
//       if (this.entitiesWithAlerts.length > 0) {
//         const entidad = this.entitiesWithAlerts[0];
//         this.commands = entidad.commands || [];

//         if (entidad.commandTypes) {
//           // Procesa los tipos de comandos si existen
//           this.actuadores = {
//             toggle: (entidad.commandTypes.toggle || []).map((item: any) =>
//               typeof item === 'string' ? JSON.parse(item) : item
//             ),
//             analogo: entidad.commandTypes.analogo || [],
//             dial: entidad.commandTypes.dial || [],
//             toggleText: entidad.commandTypes.toggleText || []
//           };

//           console.log("Actuadores cargados:", this.actuadores);

//           // Llama a la función para verificar las reglas activas
//           this.checkReglasActivas(entidad.id);
//           console.log(this.checkReglasActivas(entidad.id));

//           // Inicializa estados desde los comandos
//           this.estadoToggles = this.actuadores.toggle.map((_, i) => this.obtenerEstadoToggle(i));
//           this.estadoAnalogos = this.actuadores.analogo.map((_, i) => this.obtenerEstadoAnalogo(i));
//           this.estadoDiales = this.actuadores.dial.map((_, i) => this.obtenerEstadoDial(i));
//           this.estadoTextos = this.actuadores.toggleText.map((_, i) => this.obtenerEstadoTexto(i));
//         }

//         // Si la entidad tiene variables, carga los datos históricos
//         if (Array.isArray(entidad.variables) && entidad.variables.length > 0) {
//           this.loadHistoricalData(entidad.id);
//         } else {
//           console.warn("⚠️ La entidad no tiene variables. Se omite carga de historial.");
//         }
//       }

//       // *** AÑADIDO: Forzar detección de cambios para que el HTML se actualice ***
//       this.cdr.detectChanges();
//     });

//     // Si no se reciben datos después de un tiempo, intenta cargar las entidades desde la API
//     setTimeout(() => {
//       if (!this.socketService.hasReceivedData()) {
//         this.socketService.loadEntitiesFromAPI(fiwareService, fiwareServicePath, this.fiwareService);
//       }
//     }, 3000);
//   } else {
//     console.error('❌ No se encontraron fiwareService o fiwareServicePath en sessionStorage');
//   }

//   // Asigna un color aleatorio para el pastel
//   this.pastelColor = this.getRandomPastelColor();
// }

ngOnInit(){
  this.ngSensors();
}

ngSensors() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
    });

    const fiwareService = sessionStorage.getItem('fiware-service');
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath');

    if (fiwareService && fiwareServicePath) {

      this.socketService.entitiesWithAlerts$.subscribe((entities: any[]) => {
        this.entitiesWithAlerts = entities;
        console.log("entidades: ", this.entitiesWithAlerts);

        if (entities.length > 0) {
          const entityId = entities[0].id;
          this.loadHistoricalData(entityId);
        }
      });


      setTimeout(() => {
        if (!this.socketService.hasReceivedData()) {
          this.socketService.loadEntitiesFromAPI(fiwareService, fiwareServicePath, this.fiwareService);
        }
      }, 3000);
    } else {
      console.error('❌ No se encontraron fiwareService o fiwareServicePath en sessionStorage');
    }
  }
ngAfterViewChecked(): void {
    if (this.variables.length > 0 &&
      this.chartContainers.length === this.variables.length &&
      !this.chartsRendered) {
      this.chartsRendered = true;
      this.renderCharts();
      this.cdr.detectChanges();
    }
  }

  loadHistoricalData(entityId: string) {
    this.fiwareService.getHistoricalData(entityId).subscribe(response => {
      console.log("Respuesta de datos históricos:", response);

      const parsedData: { [name: string]: any } = {};

      response.values.forEach((entry: any) => {
        if (Array.isArray(entry.value)) {
          entry.value.forEach((sensor: any) => {
            const key = sensor.name;
            if (!parsedData[key]) {
              parsedData[key] = {
                name: sensor.name,
                unit: sensor.unit,
                data: []
              };
            }
            parsedData[key].data.push({
              timestamp: new Date(entry.timestamp),
              value: sensor.value,
              unit: sensor.unit
            });
          });
        }
      });

      const mappedVariables = Object.values(parsedData)
        .map((sensor: any) => {
          const lastValue = sensor.data[sensor.data.length - 1]?.value;
          return {
            ...sensor,
            value: lastValue + ' ' + sensor.unit,
            alert: {
              name: "Fresco",
              color: "#1a5fb4",
              level: 1
            }
          };
        })
        .filter(sensor => !isNaN(parseFloat(sensor.value)));

      if (mappedVariables.length === 0) {
        console.warn("⚠️ No hay variables válidas con datos numéricos. No se carga historial.");
        return;
      }

      this.variables = mappedVariables;
      this.chartsRendered = false;
    });
  }

  renderCharts() {
    this.chartContainers.forEach((containerRef, index) => {
      const variable = this.variables[index];

      setTimeout(() => {
        const chart = new CanvasJS.Chart(containerRef.nativeElement, {
          animationEnabled: true,
          theme: "light2",
          title: {
            text: variable.name
          },
          axisX: {
            title: "Tiempo",
            valueFormatString: "HH:mm"
          },
          axisY: {
            title: `Valor (${variable.unit})`,
            includeZero: false
          },
          data: [{
            type: "spline",
            name: variable.name,
            showInLegend: false,
            toolTipContent: "{x}: {y} " + variable.unit,
            dataPoints: variable.data.map((item: { timestamp: Date; value: number }) => ({
              x: new Date(item.timestamp),
              y: item.value
            }))
          }]
        });
        chart.render();
      }, 100);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  onBackClick() {
    this.router.navigate([`/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}`]);
  }

  onCreateClick() {
    this.router.navigate([`/premium/devices`]);
  }

  getNumericValue(value: string): number {
    return parseFloat(value) || 0;
  }

  getGaugeRange(variable: any): { min: number; max: number } {
    return {
      min: variable.minGauge ?? 0,
      max: variable.maxGauge ?? 100
    };
  }

  getGaugeThresholds(variable: any): any[] {
    return [
      {
        value: variable.minGauge ?? 0,
        color: variable.colorGauge || '#fff'
      },
      {
        value: variable.maxGauge ?? 100,
        color: variable.colorGauge || '#fff'
      }
    ];
  }

  getGaugeColor(variable: any): string {
    return variable.colorGauge || '#fff';
  }

  estadoToggles: boolean[] = [];
  estadoAnalogos: number[] = [];
  estadoDiales: string[] = [];
  estadoTextos: string[] = [];
  valorAnalogico: number = 0;
  dialValue = 0;
  dialRotation = 0;
  valorTextoActuador: string = '';
  valorActual: string = 'Valor inicial';

  obtenerEstadoToggle(index: number): boolean {
    const estado = this.commands[index]?.states?.trim();
    return estado ? estado !== '0' && estado.toLowerCase() !== 'off' : false;
  }

  obtenerEstadoAnalogo(index: number): number {
    const estado = this.commands[index]?.states?.trim();
    return estado ? parseInt(estado, 10) : 0;
  }

  obtenerEstadoDial(index: number): string {
    return this.commands[index]?.states?.trim() || 'OFF';
  }

  obtenerEstadoTexto(index: number): string {
    return this.commands[index]?.states?.trim() || '';
  }

  toggleActuador(index: number): void {
    this.estadoToggles[index] = !this.estadoToggles[index];
    this.commands[index].states = this.estadoToggles[index] ? 'ON' : 'OFF';
    console.log(`Toggle ${index} cambiado a ${this.commands[index].states}`);
  }

  enviarValorAnalogico(valor: number): void {
    this.valorAnalogico = valor;
    this.actuadores.analogo.forEach((_, i) => {
      this.commands[i].states = valor.toString();
      this.estadoAnalogos[i] = valor;
    });
    console.log('Valor analógico enviado:', valor);
  }

  changeDial() {
    this.dialValue = (this.dialValue + 1) % 6;
    this.dialRotation = this.dialValue * 60;
    this.selectedDial = this.dialLevels[this.dialValue];
    this.actuadores.dial.forEach((_, i) => {
      this.commands[i].states = this.selectedDial;
      this.estadoDiales[i] = this.selectedDial;
    });
    console.log("Dial en posición:", this.selectedDial);
  }

  actualizarActuadorTexto(): void {
    this.valorActual = this.valorTextoActuador;
    this.actuadores.toggleText.forEach((_, i) => {
      this.commands[i].states = this.valorTextoActuador;
      this.estadoTextos[i] = this.valorTextoActuador;
    });
    console.log('Texto actualizado:', this.valorTextoActuador);
  }

  getRandomPastelColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  }

  dialLevels = ['OFF', '1', '2', '3', '4', '5'];
  selectedDial = 'OFF';

  selectDial(level: string) {
    this.selectedDial = level;
    this.actuadores.dial.forEach((_, i) => {
      this.commands[i].states = level;
      this.estadoDiales[i] = level;
    });
    console.log("Dial seleccionado:", this.selectedDial);
  }

  getDialPosition(index: number, total: number): string {
    const angle = (360 / total) * index - 90;
    const radius = 80;
    const x = radius * Math.cos(angle * (Math.PI / 180));
    const y = radius * Math.sin(angle * (Math.PI / 180));
    return `translate(${x}px, ${y}px)`;
  }

onCreateCondition(idActuador: string,idEntities:string) {
  this.fiwareService.setIdActuador(idEntities);
  this.router.navigate([
    `/premium/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}/${idActuador}/conditions/create`
  ]);
}

 // Añade esta propiedad para almacenar si tiene regla activa por actuador
reglasActivasToggle: boolean[] = [];
reglasActivasAnalogo: boolean[] = [];
reglasActivasDial: boolean[] = [];
reglasActivasTexto: boolean[] = [];

checkReglasActivas(entityId: string) {
  // Inicializamos los arrays que marcarán si hay reglas activas
  this.reglasActivasToggle = [];
  this.reglasActivasAnalogo = [];
  this.reglasActivasDial = [];
  this.reglasActivasTexto = [];

  // Reglas para TOGGLES
  this.actuadores.toggle.forEach((_, i) => {
    const command = this.commands[i]?.command || this.commands[i]?.name || '';
    if (entityId && command) {
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, command).subscribe({
        next: (res) => {
          this.reglasActivasToggle[i] = Array.isArray(res) ? res.length > 0 : false;
        },
        error: (err) => {
          console.error(`❌ Error en toggle ${i}:`, err);
          this.reglasActivasToggle[i] = false;
        }
      });
    } else {
      console.warn(`⚠️ Datos faltantes en toggle ${i}:`, entityId, command);
      this.reglasActivasToggle[i] = false;
    }
  });

  // Reglas para ANALOGO
  this.actuadores.analogo.forEach((_, i) => {
    const index = this.actuadores.toggle.length + i;
    const command = this.commands[index]?.command || this.commands[index]?.name || '';
    if (entityId && command) {
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, command).subscribe({
        next: (res) => {
          this.reglasActivasAnalogo[i] = Array.isArray(res) ? res.length > 0 : false;
        },
        error: (err) => {
          console.error(`❌ Error en analogo ${i}:`, err);
          this.reglasActivasAnalogo[i] = false;
        }
      });
    } else {
      this.reglasActivasAnalogo[i] = false;
    }
  });

  // Reglas para DIAL
  this.actuadores.dial.forEach((_, i) => {
    const index = this.actuadores.toggle.length + this.actuadores.analogo.length + i;
    const command = this.commands[index]?.command || this.commands[index]?.name || '';
    if (entityId && command) {
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, command).subscribe({
        next: (res) => {
          this.reglasActivasDial[i] = Array.isArray(res) ? res.length > 0 : false;
        },
        error: (err) => {
          console.error(`❌ Error en dial ${i}:`, err);
          this.reglasActivasDial[i] = false;
        }
      });
    } else {
      this.reglasActivasDial[i] = false;
    }
  });

  // Reglas para TOGGLE TEXT
  this.actuadores.toggleText.forEach((_, i) => {
    const index = this.actuadores.toggle.length + this.actuadores.analogo.length + this.actuadores.dial.length + i;
    const command = this.commands[index]?.command || this.commands[index]?.name || '';
    if (entityId && command) {
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, command).subscribe({
        next: (res) => {
          this.reglasActivasTexto[i] = Array.isArray(res) ? res.length > 0 : false;
        },
        error: (err) => {
          console.error(`❌ Error en texto ${i}:`, err);
          this.reglasActivasTexto[i] = false;
        }
      });
    } else {
      this.reglasActivasTexto[i] = false;
    }
  });
}
}
