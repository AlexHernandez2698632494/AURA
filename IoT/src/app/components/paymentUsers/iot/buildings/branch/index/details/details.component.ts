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

declare var CanvasJS: any;

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent, NgxGaugeModule,FormsModule],
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

  variables: any[] = [];

  @ViewChildren('chartContainer') chartContainers!: QueryList<ElementRef>;

  private chartsRendered = false; // ✅ control de renderizado

  constructor(
    private paymentUserService: PaymentUserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fiwareService: FiwareService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef // ✅ necesario para AfterViewChecked
  ) {}

  ngOnInit() {
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

    // 🔥 Compatibilidad temporal con datos falsos
    // this.variables = [
    //   {
    //     name: "Temperatura Aire",
    //     value: "22.59 °C",
    //     unit: "°C",
    //     alert: { name: "Fresco", color: "#1a5fb4", level: 1 },
    //     data: this.generateFakeData(10, "°C")
    //   },
    //   {
    //     name: "Humedad del Aire",
    //     value: "25.67 %",
    //     unit: "%",
    //     alert: { name: "Seco", color: "#1a5fb4", level: 1 },
    //     data: this.generateFakeData(10, "%")
    //   },
    //   {
    //     name: "Cantidad de lluvia",
    //     value: "1.29 mm",
    //     unit: "mm",
    //     alert: { name: "Débil", color: "#1a5fb4", level: 1 },
    //     data: this.generateFakeData(10, "mm")
    //   },
    // ];
  }

  ngAfterViewChecked(): void {
    // ✅ Renderizar solo si las gráficas no han sido pintadas y los contenedores están listos
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

      this.variables = Object.values(parsedData).map((sensor: any) => ({
        ...sensor,
        value: sensor.data[sensor.data.length - 1]?.value + ' ' + sensor.unit,
        alert: {
          name: "Fresco",
          color: "#1a5fb4",
          level: 1
        }
      }));

      this.chartsRendered = false; // ⚠️ permitir nuevo render
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

  // generateFakeData(count: number, unit: string) {
  //   const data = [];
  //   const now = new Date();
  //   for (let i = count - 1; i >= 0; i--) {
  //     const timestamp = new Date(now);
  //     timestamp.setHours(now.getHours() - (count - 1 - i));
  //     const value = (Math.random() * 50 + 10).toFixed(2);
  //     data.push({
  //       timestamp: timestamp,
  //       value: parseFloat(value),
  //       unit: unit
  //     });
  //   }
  //   return data;
  // }

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
  estadoActuador: boolean = false; // false = apagado, true = encendido
  valorAnalogico: number = 128;
  
  toggleActuador(): void {
    this.estadoActuador = !this.estadoActuador;
    console.log('Actuador encendido:', this.estadoActuador);
    // Aquí podrías llamar a un servicio para enviar el estado al backend
  }
  
  enviarValorAnalogico(valor: number): void {
    console.log('Valor analógico enviado:', valor);
    // Aquí también podrías comunicarte con un backend o broker MQTT
  }
  dialValue = 0; // 0 = OFF, 1..5 = niveles
  dialRotation = 0; // ángulo de rotación
  
  changeDial() {
    this.dialValue = (this.dialValue + 1) % 6; // OFF → 1 → 2 → 3 → 4 → 5 → OFF
    this.dialRotation = this.dialValue * 60; // 6 posiciones, 360° / 6 = 60°
    // Aquí podrías emitir el valor a tu backend o usarlo para controlar el actuador
    console.log("Dial en posición:", this.dialValue === 0 ? "OFF" : this.dialValue);
  }
  valorTextoActuador: string = '';   // Valor del actuador de texto (vacío al principio)
  valorActual: string = 'Valor inicial';    // Método que se llama al escribir en el campo de texto
 // Método que se llama al hacer clic en el botón de actualización
 actualizarActuadorTexto() {
  this.valorActual = this.valorTextoActuador;  // Cambia el valor mostrado a lo que se ingresó
  console.log('Valor del actuador de texto actualizado:', this.valorActual);
  // Aquí podrías hacer algo con el valor del actuador (por ejemplo, enviarlo a un servicio)
}}
