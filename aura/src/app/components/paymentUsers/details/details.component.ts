import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  providers: [DatePipe]
})
export class SubscriptionsDetailsComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true;
  subscription: any = null;
  _id: string = '';

  constructor(
    private paymentUserService: PaymentUserService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    // Obtener el registrationKey desde sessionStorage
    this._id = sessionStorage.getItem('registrationKey') || '';

    if (this._id) {
      this.paymentUserService.getUsersSubscriptions(this._id).subscribe(
        (data) => {
          // Verificar que los datos sean correctos
          if (data) {
            this.subscription = data;

            // Convertir fecha de expiración a formato 'dd-MM-yyyy'
            if (this.subscription.expiresAt) {
              this.subscription.expiresAt = this.datePipe.transform(this.subscription.expiresAt, 'dd-MM-yyyy');
            }

            // Traducir tipo de plan
            const planTypes: { [key: string]: string } = {
              free: 'Gratis',
              illimit: 'Ilimitado',
              month: 'Pagado',
              year: 'Pagado',
            };
            this.subscription.planType = planTypes[this.subscription.planType] || 'Desconocido';
          }
        },
        (error) => {
          console.error('Error al obtener las suscripciones:', error);
        }
      );
    } else {
      console.error('No se encontró el registrationKey en sessionStorage');
    }
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
