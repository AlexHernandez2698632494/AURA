import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private socketReceived = false;
  private entitiesWithAlertsSubject = new Subject<any[]>();
  public entitiesWithAlerts$ = this.entitiesWithAlertsSubject.asObservable();

  constructor(
    private apiConfig: ApiConfigService,
    private toastr: ToastrService
  ) {
    this.socket = io(`${this.apiConfig.getApiUrl()}`);
    this.initializeSocketListeners();
  }

  // Inicializa los listeners del socket
  private initializeSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('✅ Socket conectado');
    });

    // Escuchar el evento de alerta y emitir el toast
    this.socket.on('orion-alert', (entityWithAlert: any) => {
      this.socketReceived = true;
      this.applyGaugeLogic(entityWithAlert);
      this.entitiesWithAlertsSubject.next([entityWithAlert]);

      // Emitir el toast solo si el nivel es 4 o 5
      this.emitToast(entityWithAlert);
    });

    this.socket.on('disconnect', () => {
      console.warn('❌ Socket desconectado');
    });
  }

  // Emite el toast con la alerta
  private emitToast(entityWithAlert: any): void {
    const deviceName = entityWithAlert.raw.deviceName;
    const newLevel = entityWithAlert.nivel;
    const highestAlertVariable = entityWithAlert.highestAlertVariable ?? 'Desconocido';
    const highestAlertName = entityWithAlert.highestAlertName ?? 'Desconocida';

    // Solo mostrar el toast si el nivel es 4 o 5
    if (newLevel !== 4 && newLevel !== 5) {
      return;  // No hacer nada si el nivel no es 4 ni 5
    }

    // Título del Toast
    const title = 'ALERTA';

    // Mensaje del Toast más claro
    const message = `Alerta en el dispositivo "${deviceName}": La variable "${highestAlertVariable}" ha alcanzado el nivel ${newLevel} en "${highestAlertName}".`;

    // Determinar la clase del Toast según el nivel
    let toastClass = '';
    if (newLevel === 4) {
      toastClass = 'toast-warning';  // Para nivel 4, se muestra como warning
    } else if (newLevel === 5) {
      toastClass = 'toast-error';  // Para nivel 5, se muestra como error
    }

    // Mostrar el Toast
    this.toastr.show(message, title, {
      timeOut: 5000,
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      toastClass: `ngx-toastr ${toastClass}`
    });
  }

  // Lógica para calcular los rangos de alerta de las variables
  private applyGaugeLogic(entity: any): void {
    entity.variables.forEach((variable: any) => {
      const hasAlert = !!variable.alert;

      if (variable.alertLevels?.length) {
        variable.minGauge = Math.min(...variable.alertLevels.map((a: any) => a.initialRange));
        variable.maxGauge = Math.max(...variable.alertLevels.map((a: any) => a.finalRange));
      } else if (hasAlert) {
        variable.minGauge = variable.minRange ?? 0;
        variable.maxGauge = variable.maxRange ?? 100;
      } else {
        variable.minGauge = 0;
        variable.maxGauge = 100;
      }

      variable.colorGauge = hasAlert ? (variable.alert?.color || '#fff') : '#fff';
    });
  }

  // Método para verificar si ya se recibieron datos
  public hasReceivedData(): boolean {
    return this.socketReceived;
  }

  // Método para cargar entidades desde la API
  public loadEntitiesFromAPI(
    fiwareService: string,
    fiwareServicePath: string,
    fiwareServiceAPI: any
  ): void {
    fiwareServiceAPI.getEntitiesWithAlerts(fiwareService, fiwareServicePath).subscribe((entities: any[]) => {
      entities.forEach(entity => this.applyGaugeLogic(entity));
      this.entitiesWithAlertsSubject.next(entities);
    });
  }
}
