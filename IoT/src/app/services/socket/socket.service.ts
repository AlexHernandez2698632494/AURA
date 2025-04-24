import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { FiwareService } from '../fiware/fiware.service'; // ✅ Importa correctamente
import { ApiConfigService } from '../ApiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private socketReceived = false;
  private entitiesWithAlertsSubject = new Subject<any[]>();
  public entitiesWithAlerts$ = this.entitiesWithAlertsSubject.asObservable();

  constructor(private apiConfig: ApiConfigService) {
    this.socket = io(`${this.apiConfig.getApiUrl()}`); // Cambia esto si tu backend no es localhost
    this.initializeSocketListeners();
  }

  private initializeSocketListeners(): void {
    this.socket.on('connect', () => {
      console.log('✅ Socket conectado');
    });

    this.socket.on('orion-alert', (entityWithAlert: any) => {
      this.socketReceived = true;
      this.applyGaugeLogic(entityWithAlert);
      this.entitiesWithAlertsSubject.next([entityWithAlert]);
    });

    this.socket.on('disconnect', () => {
      console.warn('❌ Socket desconectado');
    });
  }

  public loadEntitiesFromAPI(
    fiwareService: string,
    fiwareServicePath: string,
    fiwareServiceAPI: FiwareService // ✅ Uso del tipo correcto
  ): void {
    fiwareServiceAPI.getEntitiesWithAlerts(fiwareService, fiwareServicePath).subscribe((entities: any[]) => {
      entities.forEach(entity => this.applyGaugeLogic(entity));
      this.entitiesWithAlertsSubject.next(entities);
    });
  }

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

  public hasReceivedData(): boolean {
    return this.socketReceived;
  }
}
