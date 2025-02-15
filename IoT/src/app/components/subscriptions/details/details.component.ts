import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-details',
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent, RouterOutlet],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class SubscriptionsDetailsComponent {

  isLargeScreen: boolean = window.innerWidth > 1024;
      @Output() bodySizeChange = new EventEmitter<boolean>();
      @HostListener('window:resize', ['$event'])
      onResize(event: Event): void {
        this.isLargeScreen = window.innerWidth > 1024;
      }
  
      isSidebarCollapsed = true
      onSideNavToggle(collapsed: boolean) {
        this.isSidebarCollapsed = collapsed;
      }

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
