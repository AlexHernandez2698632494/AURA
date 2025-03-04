import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiConfigService {
  private apiUrls = [
    'http://localhost:8080',
    'http://192.168.1.82:8080',
    'http://10.0.12.71:8080',
    'http://172.16.99.86:8080',
    'http://192.168.1.25:8080',
    'http://10.0.12.86:8080',
    'http://172.16.100.200:8080',
  ];

  private selectedApiUrl: string | null = null;

  constructor() {
    this.checkApiUrls();
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

  /**
   * Devuelve la URL de la API seleccionada.
   */
  getApiUrl(): string {
    return this.selectedApiUrl ?? this.apiUrls[0];
  }
}
