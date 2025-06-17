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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    MatInputModule,
    MatProgressSpinnerModule,
    MatProgressBarModule],
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
  pendingTimeouts: (ReturnType<typeof setTimeout> | null)[] = [];
  variables: any[] = [];
  commands: any[] = [];
  private entidadMap: { [id: string]: any } = {};

  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  private chartsRendered = false;

  actuadores: {
    toggle: any[],
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

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.buildingName = params.get('buildingName') || '';
      this.branchName = params.get('branchName') || '';
      this.branchId = params.get('id') || '';
      this.deviceName = decodeURIComponent(this.router.url.split('/').pop() || '');
    });

    const fiwareService = sessionStorage.getItem('fiware-service');
    const fiwareServicePath = sessionStorage.getItem('fiware-servicepath');

    if (!fiwareService || !fiwareServicePath) {
      console.error('❌ No se encontraron fiwareService o fiwareServicePath en sessionStorage');
      return;
    }

    this.socketService.entitiesWithAlerts$.subscribe((entities: any[]) => {
      const entidad = entities.find(e => {
        const name = e.deviceName || (e.raw && e.raw.deviceName);
        return name === this.deviceName;
      });

      if (!entidad) {
        console.warn("⚠ No se encontró entidad con deviceName:", this.deviceName);
        return;
      }

      this.entitiesWithAlerts = [entidad];
      const tipo = entidad.isSensorActuador;
      console.log("datos recibidos por socket", this.entitiesWithAlerts);
      this.commands = (entidad.commands || []).map((cmd: any) => ({
        ...cmd,
        status: cmd.status ?? 'OK'
      }));

      if ((tipo === 0 || tipo === 2) && entidad.variables?.length > 0) {
        this.loadHistoricalData(entidad.id);
      }

      if (tipo === 1 || tipo === 2) {
        // commands ya asignado arriba
        this.actuadores = {
          toggle: entidad.commandTypes?.toggle || [],
          analogo: entidad.commandTypes?.analogo || [],
          dial: entidad.commandTypes?.dial || [],
          toggleText: entidad.commandTypes?.toggleText || []
        };

        // Aquí cambiamos para usar `this.commands` y obtener el estado correcto para cada tipo
        this.estadoToggles = this.actuadores.toggle.map((actuador, i) => this.obtenerEstadoDesdeCommands('switch', actuador.name));
        this.estadoAnalogos = this.actuadores.analogo.map((actuador, i) => this.obtenerEstadoDesdeCommands('analogo', actuador.name));
        this.estadoDiales = this.actuadores.dial.map((actuador, i) => this.obtenerEstadoDesdeCommands('dial', actuador.name));

        this.selectedDiales = [...this.estadoDiales];
        this.valorTextoActuadores = this.actuadores.toggleText.map((actuador, i) => this.obtenerEstadoDesdeCommands('switchText', actuador.name) || '');

        this.valoresActuales = [...this.valorTextoActuadores];

        console.log('Estado de Toggles:', this.estadoToggles);
        console.log('Estado de Analogos:', this.estadoAnalogos);
        console.log('Estado de Diales:', this.estadoDiales);
        console.log('Estado de Textos:', this.estadoTextos);

        this.checkReglasActivas(entidad.id);
        this.checkEstadosDeReglas(entidad.id);
      }

      // 🔄 Cada vez que llega info por socket, revisamos estados
      this.actualizarEstadosDesdeSocket();

      this.cdr.detectChanges();
    });

    // Fallback si el socket no envía datos a tiempo
    setTimeout(() => {
      if (!this.socketService.hasReceivedData()) {
        this.socketService.loadEntitiesFromAPI(fiwareService, fiwareServicePath, this.fiwareService);
      }
    }, 0);

    this.pastelColor = this.getRandomPastelColor();
  }

  // Función que obtiene el estado desde `this.commands` usando el nombre del actuador
  obtenerEstadoDesdeCommands(commandType: string, name: string): any {
    const command = this.commands.find(cmd => cmd.name === name);
    const estado = command?.states?.toLowerCase().trim();

    if (commandType === 'switch') {
      return estado === 'on'; // ✅ "on" será true, cualquier otro será false
    }

    if (commandType === 'analogo') {
      return parseInt(command?.states, 10) || 0;
    }

    if (commandType === 'dial') {
      return command?.states || 'OFF';
    }

    if (commandType === 'switchText') {
      return command?.states || '';
    }

    return '';
  }

  actualizarEstadosDesdeSocket(): void {
    this.commands.forEach((cmd, i) => {
      if (cmd.status === 'OK') {
        if (this.pendingTimeouts[i]) {
          clearTimeout(this.pendingTimeouts[i]!);
          this.pendingTimeouts[i] = null;
        }

        // Calcular índices de cada tipo de actuador
        const toggleLen = this.actuadores.toggle.length;
        const analogoLen = this.actuadores.analogo.length;
        const dialLen = this.actuadores.dial.length;

        if (i < toggleLen) {
          this.estadoToggles[i] = cmd.states?.toLowerCase() === 'on';
        } else if (i < toggleLen + analogoLen) {
          const index = i - toggleLen;
          this.estadoAnalogos[index] = parseInt(cmd.states) || 0;
        } else if (i < toggleLen + analogoLen + dialLen) {
          const index = i - toggleLen - analogoLen;
          this.estadoDiales[index] = cmd.states || 'OFF';
          this.selectedDiales[index] = cmd.states || 'OFF';
        } else {
          const index = i - toggleLen - analogoLen - dialLen;
          this.estadoTextos[index] = cmd.states || '';
          this.valoresActuales[index] = cmd.states || '';
        }
      }
    });

    this.cdr.detectChanges();
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
          const lastEntry = sensor.data[sensor.data.length - 1];
          const numericValue = parseFloat(lastEntry?.value);
          return {
            ...sensor,
            value: numericValue,
            valueFormatted: `${numericValue} ${sensor.unit}`,
            alert: {
              name: "Fresco",
              color: "#1a5fb4",
              level: 1
            }
          };
        })
        .filter(sensor => !isNaN(sensor.value));

      if (mappedVariables.length === 0) {
        console.warn("⚠ No hay variables válidas con datos numéricos. No se carga historial.");
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
    this.router.navigate([`/premium/iot/overview/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}`]);
  }

  onCreateClick() {
    this.router.navigate([`/premium/iot/overview/devices`]);
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
  timersDial: any[] = [];
  estadoDialesPrevios: string[] = [];
  estadoTextos: string[] = [];
  valorAnalogico: number = 0;
  dialValue = 0;
  dialRotation = 0;
  valorTextoActuadores: string[] = [];
  valoresActuales: string[] = [];


  obtenerEstadoToggle(index: number): boolean {
    const estado = this.commands[index]?.states?.trim();
    return estado ? estado !== '0' && estado.toLowerCase() !== 'OFF' : false;
  }

  getCommandStatus(name: string): string {
    const command = this.commands.find(c => c.name === name);
    return command?.status || '';
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
  enviarComandoActuador(attributeName: string, value: any): void {
    console.log('Enviando comando al actuador:', attributeName, value);
    console.log('Entidad con alertas:', this.entitiesWithAlerts[0].id);
    const payload = {
      id: this.entitiesWithAlerts[0].id,
      attributeName: attributeName,
      value: value
    };

    this.fiwareService.updateActuador(payload).subscribe({
      next: res => {
        console.log('Comando enviado con éxito', res);
      },
      error: err => {
        console.error('Error al enviar comando', err);
      }
    });
  }

  getBotonTexto(i: number): string {
    const command = this.commands[i];
    const estado = this.estadoToggles[i];

    if (command?.status === "PENDING") return "Esperando…";
    if (command?.status === "FAILED") return "Reintentar";

    if (command?.status === "ON" || estado) return "Encendido";
    if (command?.status === "OFF" || estado) return "Apagado";

    return "No Reportado";
  }

  toggleActuador(index: number, deviceId: string): void {
    const cmd = this.commands[index];
    if (!cmd) return;

    if (cmd.status === 'PENDING') return;

    const nextState = cmd.states?.toLowerCase() === 'on' ? 'OFF' : 'ON';

    if (this.pendingTimeouts[index]) {
      clearTimeout(this.pendingTimeouts[index]!);
    }

    this.pendingTimeouts[index] = setTimeout(() => {
      if (this.commands[index]?.status === 'PENDING') {
        const rawDeviceId = deviceId;
        const parts = rawDeviceId.split(':');
        const cleanDeviceId = parts[2] + parts[3];
        console.log("deviceId", cleanDeviceId);

        this.fiwareService.getDeviceById(cleanDeviceId).subscribe({
          next: (device: any) => {
            console.log("Dispositivo obtenido:", device);

            if (device && device.device_id === cleanDeviceId) {
              const commandName = this.commands[index].name;
              const body = {
                [`${commandName}_status`]: 'FAILED',
              };

              this.fiwareService.FailedStatusGhost(device.apikey, device.device_id, body).subscribe({
                next: (res) => {
                  console.log("Estado fantasma enviado:", res);
                  this.commands[index].status = 'FAILED';
                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error("Error al enviar estado fantasma:", err);
                }
              });
            } else {
              console.warn("No se encontró el dispositivo con ID:", cleanDeviceId);
            }
          },
          error: (err) => {
            console.error("Error al obtener el dispositivo:", err);
          }
        });
      }
    }, 10000); // 10 segundos

    cmd.status = 'PENDING';
    cmd.states = nextState;
    this.cdr.detectChanges();

    // Envía comando al backend
    this.enviarComandoActuador(cmd.name, nextState);
  }

  enviarValorAnalogico(valor: number, index: number, deviceId: string): void {
    const commandIndex = this.actuadores.toggle.length + index;
    const cmd = this.commands[commandIndex];
    if (!cmd || cmd.status === 'PENDING') return;

    this.commands[commandIndex].status = 'PENDING';
    this.cdr.detectChanges();

    if (this.pendingTimeouts[commandIndex]) {
      clearTimeout(this.pendingTimeouts[commandIndex]);
    }

    this.pendingTimeouts[commandIndex] = setTimeout(() => {
      if (this.commands[commandIndex]?.status === 'PENDING') {
        const rawDeviceId = deviceId;
        const parts = rawDeviceId.split(':');
        const cleanDeviceId = parts[2] + parts[3];

        this.fiwareService.getDeviceById(cleanDeviceId).subscribe({
          next: (device: any) => {
            if (device && device.device_id === cleanDeviceId) {
              const commandName = this.commands[commandIndex].name;
              const body = {
                [`${commandName}_status`]: 'FAILED',
              };
              this.fiwareService.FailedStatusGhost(device.apikey, device.device_id, body).subscribe({
                next: (res) => {
                  console.log('Estado fantasma enviado:', res);
                  this.commands[commandIndex].status = 'FAILED';

                  // Obtener valor actual desde backend (states viene como string)
                  const valorBackend = parseFloat(this.commands[commandIndex].states);
                  this.estadoAnalogos[index] = isNaN(valorBackend) ? 0 : valorBackend;

                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error('Error al enviar estado fantasma:', err);
                }
              });
            }
          },
          error: (err) => {
            console.error('Error al obtener el dispositivo:', err);
          }
        });
      }
    }, 10000);

    this.enviarComandoActuador(cmd.name, valor.toString());
  }

  changeDial(index: number): void {
    const currentValue = this.selectedDiales[index] || 'OFF';
    const currentLevelIndex = this.dialLevels.indexOf(currentValue);
    const newLevelIndex = (currentLevelIndex + 1) % this.dialLevels.length;
    const newLevel = this.dialLevels[newLevelIndex];

    this.selectedDiales[index] = newLevel;

    const commandIndex = this.actuadores.toggle.length + this.actuadores.analogo.length + index;
    if (this.commands[commandIndex]) {
      this.commands[commandIndex].states = newLevel;
      this.estadoDiales[index] = newLevel;
    }

    console.log(`Dial ${index} actualizado a:`, newLevel);
  }


  actualizarActuadorTexto(index: number): void {
    const nuevoValor = this.valorTextoActuadores[index]?.trim() || '';
    if (!nuevoValor) return;

    const commandIndex = this.actuadores.toggle.length +
      this.actuadores.analogo.length +
      this.actuadores.dial.length +
      index;

    const command = this.commands[commandIndex];
    const actuador = this.actuadores.toggleText[index];

    if (command) {
      command.states = nuevoValor;
      this.estadoTextos[index] = nuevoValor;
      this.valoresActuales[index] = nuevoValor;

      this.valorTextoActuadores[index] = '';

      this.enviarComandoActuador(actuador.name, nuevoValor);
    }
  }



  getRandomPastelColor(): string {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 85%)`;
  }

  dialLevels = ['OFF', '1', '2', '3', '4', '5'];
  selectedDiales: string[] = [];

  selectDial(level: string, index: number): void {
    this.selectedDiales[index] = level;

    const commandIndex = this.actuadores.toggle.length + this.actuadores.analogo.length + index;
    const cmd = this.commands[commandIndex];
    const actuador = this.actuadores.dial[index];

    if (!cmd || cmd.status === 'PENDING') return;

    // Guardar el estado anterior
    this.estadoDialesPrevios = this.estadoDialesPrevios || [];
    this.estadoDialesPrevios[index] = this.selectedDiales[index];

    this.commands[commandIndex].states = level;
    this.commands[commandIndex].status = 'PENDING';
    this.estadoDiales[index] = level;
    this.cdr.detectChanges();

    // Limpiar timeout si ya existe
    if (this.pendingTimeouts[commandIndex]) {
      clearTimeout(this.pendingTimeouts[commandIndex]);
    }

    // Temporizador de 10 segundos
    this.pendingTimeouts[commandIndex] = setTimeout(() => {
      if (this.commands[commandIndex]?.status === 'PENDING') {
        const rawDeviceId = this.entitiesWithAlerts[0]?.id;
        const parts = rawDeviceId.split(':');
        const cleanDeviceId = parts[2] + parts[3];

        this.fiwareService.getDeviceById(cleanDeviceId).subscribe({
          next: (device: any) => {
            if (device && device.device_id === cleanDeviceId) {
              const commandName = this.commands[commandIndex].name;
              const body = {
                [`${commandName}_status`]: 'FAILED',
              };

              this.fiwareService.FailedStatusGhost(device.apikey, device.device_id, body).subscribe({
                next: (res) => {
                  console.log('📨 Estado FAILED enviado para dial:', res);

                  // Cambiar estado visual
                  this.commands[commandIndex].status = 'FAILED';
                  this.selectedDiales[index] = 'OFF';
                  this.estadoDiales[index] = 'OFF';

                  this.cdr.detectChanges();
                },
                error: (err) => {
                  console.error('❌ Error al enviar estado fantasma para dial:', err);
                }
              });
            }
          },
          error: (err) => {
            console.error('❌ Error al obtener el dispositivo para dial:', err);
          }
        });
      }
    }, 10000);

    // Enviar comando real al actuador
    this.enviarComandoActuador(actuador.name, level);
  }

  getDialPosition(index: number, total: number): string {
    const angle = (360 / total) * index - 90;
    const radius = 80;
    const x = radius * Math.cos(angle * (Math.PI / 180));
    const y = radius * Math.sin(angle * (Math.PI / 180));
    return `translate(${x}px, ${y}px)`;
  }

  onCreateCondition(idActuador: string, idEntities: string) {
    this.fiwareService.setIdActuador(idEntities);
    this.router.navigate([
      `/premium/iot/overview/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}/${idActuador}/conditions/create`
    ]);
  }

  onOverviewCondition(idActuador: string, idEntities: string) {
    this.fiwareService.setIdActuador(idEntities);
    this.router.navigate([
      `/premium/iot/overview/building/${this.buildingName}/level/${this.branchId}/branch/${this.branchName}/${this.deviceName}/${idActuador}/overview/conditions/`
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
            this.reglasActivasToggle[i] = Array.isArray(res) && res.some(
              regla => regla.command === command && regla.actuatorEntityId === entityId && regla.enabled
            );
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
            this.reglasActivasAnalogo[i] = Array.isArray(res) && res.some(
              regla => regla.command === command && regla.actuatorEntityId === entityId && regla.enabled
            );
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
            this.reglasActivasDial[i] = Array.isArray(res) && res.some(
              regla => regla.command === command && regla.actuatorEntityId === entityId && regla.enabled
            );
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
            this.reglasActivasTexto[i] = Array.isArray(res) && res.some(
              regla => regla.command === command && regla.actuatorEntityId === entityId && regla.enabled
            );
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

  iconoEstadoReglaToggle: boolean[] = [];
  iconoEstadoReglaAnalogo: boolean[] = [];
  iconoEstadoReglaDial: boolean[] = [];
  iconoEstadoReglaTexto: boolean[] = [];

  checkEstadosDeReglas(entityId: string) {
    this.iconoEstadoReglaToggle = [];
    this.iconoEstadoReglaAnalogo = [];
    this.iconoEstadoReglaDial = [];
    this.iconoEstadoReglaTexto = [];

    // TOGGLE
    this.actuadores.toggle.forEach((toggle, i) => {
      const commandName = toggle.name;
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, commandName).subscribe({
        next: (res) => {
          this.iconoEstadoReglaToggle[i] = Array.isArray(res) && res.some(
            regla => regla.command === commandName && regla.actuatorEntityId === entityId && regla.enabled
          );
        },
        error: () => this.iconoEstadoReglaToggle[i] = false
      });
    });

    // ANALOGO
    this.actuadores.analogo.forEach((analogo, i) => {
      const commandName = analogo.name;
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, commandName).subscribe({
        next: (res) => {
          this.iconoEstadoReglaAnalogo[i] = Array.isArray(res) && res.some(
            regla => regla.command === commandName && regla.actuatorEntityId === entityId && regla.enabled
          );
        },
        error: () => this.iconoEstadoReglaAnalogo[i] = false
      });
    });

    // DIAL
    this.actuadores.dial.forEach((dial, i) => {
      const commandName = dial.name;
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, commandName).subscribe({
        next: (res) => {
          this.iconoEstadoReglaDial[i] = Array.isArray(res) && res.some(
            regla => regla.command === commandName && regla.actuatorEntityId === entityId && regla.enabled
          );
        },
        error: () => this.iconoEstadoReglaDial[i] = false
      });
    });

    // TOGGLE TEXT
    this.actuadores.toggleText.forEach((text, i) => {
      const commandName = text.name;
      this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entityId, commandName).subscribe({
        next: (res) => {
          this.iconoEstadoReglaTexto[i] = Array.isArray(res) && res.some(
            regla => regla.command === commandName && regla.actuatorEntityId === entityId && regla.enabled
          );
        },
        error: () => this.iconoEstadoReglaTexto[i] = false
      });
    });
  }
  // Este método se ejecuta al hacer click en el botón de modo manual/automático
  toggleModoManualAutomatico(i: number) {
    const entity = this.entitiesWithAlerts[0];
    if (!entity) {
      console.warn('No hay entidad en entitiesWithAlerts');
      return;
    }

    const command = this.commands[i];
    if (!command) {
      console.warn(`No hay comando en commands para el índice ${i}`);
      return;
    }

    // Obtener si la regla está activa o no (modo automático = regla activa)
    const reglaActiva = this.reglasActivasToggle[i]; // true o false

    // Payload con el valor contrario de enable
    const nuevoEstado = !reglaActiva;
    console.log("Estado nuevo para toggle:", nuevoEstado);

    // Aquí necesitas el ID de la regla para actualizar,
    // asumamos que tienes una forma de obtenerlo por command y entity
    this.fiwareService.getRulesByServiceSubserviceActuatorAndCommand(entity.id, command.name).subscribe({
      next: (rules: any[]) => {
        console.log("Respuesta de getRulesByServiceSubserviceActuatorAndCommand:", rules);
        if (rules.length === 0) {
          console.warn('No se encontró regla para este comando');
          return;
        }

        const reglaId = rules[0]._id; // suponer el primer resultado
        console.log("ID de la regla obtenida:", reglaId);

        if (!reglaId) {
          console.error('El ID de la regla es undefined o null');
          return;
        }

        const payload = { enabled: nuevoEstado };

        this.fiwareService.updateRuleEnabled(payload, reglaId).subscribe({
          next: () => {
            console.log(`Regla ${reglaId} actualizada a enabled=${nuevoEstado}`);

            // Actualizamos localmente para reflejar el cambio en UI
            this.reglasActivasToggle[i] = nuevoEstado;
            this.iconoEstadoReglaToggle[i] = nuevoEstado;

            // Puedes agregar lógica para actualizar estados o refrescar datos si quieres
          },
          error: (err) => console.error('Error actualizando la regla', err)
        });
      },
      error: (err) => console.error('Error obteniendo regla para el comando', err)
    });
  }


}
