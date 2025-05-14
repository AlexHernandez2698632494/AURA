import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private apiUrls = [
    //'https://lm89f4q4-8080.use.devtunnels.ms',
    // 'http://192.168.1.82:8090',
    // "http://10.0.12.66:8090",
    "http://10.0.12.82:8090",
    //  'http://localhost:8090' ,
  ];
  private apiUrlsMoquitto = [
    // "http://10.0.12.66:8668",
    "http://10.0.12.82:8668",
    //  'http://localhost:8668' ,
  ];

  private selectedApiUrl: string | null = null;
  private selectedApiUrlMoquitto: string | null = null;

  constructor() {
    this.checkApiUrls();
    this.checkApiUrlsMoquitto();
  }

  /**
   * Intenta conectar con cada API hasta encontrar una disponible.
   */
  private async checkApiUrls() {
    for (const url of this.apiUrls) {
      try {
        // Intenta hacer una petición GET a un endpoint conocido
        const response = await fetch(`${url}/ping`, { method: 'GET' });

        if (response.ok) {
          this.selectedApiUrl = url;
          console.log(`API encontrada en: ${url}`);
          break;
        }
      } catch (error) {
        console.warn(`No se pudo conectar a: ${url}`);
      }
    }

    if (!this.selectedApiUrl) {
      console.error('No se encontró una API disponible');
      this.selectedApiUrl = this.apiUrls[0]; // Usa localhost como fallback
    }
  }
  private async checkApiUrlsMoquitto() {
    for (const url of this.apiUrlsMoquitto) {
      try {
        // Intenta hacer una petición GET a un endpoint conocido
        const response = await fetch(`${url}/ping`, { method: 'GET' });

        if (response.ok) {
          this.selectedApiUrlMoquitto = url;
          console.log(`API encontrada en: ${url}`);
          break;
        }
      } catch (error) {
        console.warn(`No se pudo conectar a: ${url}`);
      }
    }

    if (!this.selectedApiUrlMoquitto) {
      console.error('No se encontró una API disponible');
      this.selectedApiUrlMoquitto = this.apiUrlsMoquitto[0]; // Usa localhost como fallback
    }
  }

  /**
   * Devuelve la URL de la API seleccionada.
   */
  getApiUrl(): string {
    return this.selectedApiUrl ?? this.apiUrls[0];
  }
  getApiUrlMoquitto(): string {
    return this.selectedApiUrlMoquitto ?? this.apiUrlsMoquitto[0];
  }
}
