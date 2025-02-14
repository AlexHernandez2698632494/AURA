import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class SubscriptionsDetailsComponent {
  subscription: any = null;
  username: string = '';
  
  constructor(private paymentUserService: PaymentUserService) {}

  ngOnInit(): void {
    this.username = sessionStorage.getItem('usuario') || '';

    if (this.username) {
      this.paymentUserService.getUserSubscriptions(this.username).subscribe(
        (data) => {
          this.subscription = this.transformSubscription(data);
          console.log('Detalles de suscripción:', this.subscription);
        },
        (error) => {
          console.error('Error al obtener suscripción:', error);
        }
      );
    }
  }

  private transformSubscription(data: any): any {
    if (!data) return null;

    let planTypeName = 'Pagado';
    if (data.planType === 'free') planTypeName = 'Prueba';
    else if (data.planType === 'ilimit') planTypeName = 'Ilimitado';

    return {
      title: 'Gestión de dispositivos IoT',
      type: planTypeName,
      expiration: data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : 'No disponible',
      key: data.key,
      status: data.isExpired ? 'Venció' : 'Activo',
      users: data.users || [],
      userCount: data.userCount || 0
    };
  }
}
