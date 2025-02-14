import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../services/paymentUser/payment-user.service';  
import { ActivatedRoute } from '@angular/router'; 

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  subscriptions: any[] = [];  // Inicialmente vacío
  username: string = ''; // Se obtiene desde la URL

  constructor(
    private paymentUserService: PaymentUserService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.username = sessionStorage.getItem('usuario') || ''; // Obtener el username de sessionStorage
  
    console.log('Username obtenido desde sessionStorage:', this.username); 
  
    if (this.username) {
      this.paymentUserService.getUserSubscriptions(this.username).subscribe(
        (data) => {
          console.log('Datos recibidos de la API:', data);
          this.subscriptions = this.transformSubscriptions(data);
          console.log('Datos transformados:', this.subscriptions);
        },
        (error) => {
          console.error('Error al obtener suscripciones:', error);
        }
      );
    } else {
      console.warn('No se encontró username en sessionStorage.');
    }
  }
    

  private transformSubscriptions(data: any): any[] {
    if (!data) {
      console.warn('Datos vacíos recibidos en transformSubscriptions');
      return [];
    }
  
    // Convertir planType a su nombre correspondiente
    let planTypeName = 'Pagado'; // Valor por defecto
    if (data.planType === 'free') {
      planTypeName = 'Prueba';
    } else if (data.planType === 'ilimit') {
      planTypeName = 'Ilimitado';
    }
  
    return [
      {
        title: 'Gestión de dispositivos IoT',
        type: planTypeName, // Se asigna el tipo correcto
        expiration: data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'No disponible',
        status: data.isExpired ? 'Venció' : 'Activo',
        statusClass: data.isExpired ? 'vencido' : 'activo',
        users: { used: data.users ? data.users.length : 0, total: data.userCount || 0 }
      }
    ];
  }  
}
