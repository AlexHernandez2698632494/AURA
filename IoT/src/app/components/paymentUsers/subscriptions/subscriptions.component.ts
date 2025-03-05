import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { Router, RouterModule } from '@angular/router'; 
@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent, RouterModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  subscriptions: any[] = [];
  isLoading = true;
  errorMessage = '';

  @Output() bodySizeChange = new EventEmitter<boolean>();

  constructor(private paymentUserService: PaymentUserService, private router: Router) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true;

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  ngOnInit(): void {
    this.getUserSubscriptions();
  }

  getUserSubscriptions(): void {
    const userData = sessionStorage.getItem('usuario'); // Asegurándonos de que es 'usuario'
    console.log(userData)
    if (!userData) {
      this.errorMessage = 'No se encontró información del usuario';
      this.isLoading = false;
      return;
    }

    const user = userData;
   // const username = user.username || user.correo; // Ajusta esto según cómo guardes los datos

    if (!userData) {
      this.errorMessage = 'El usuario no tiene un nombre de usuario válido';
      this.isLoading = false;
      return;
    }

    this.paymentUserService.getUserSubscriptions(userData).subscribe({
      next: (response) => {
        this.subscriptions = response.registrationKeys.map((sub: any) => ({
          title: 'Gestión de dispositivos IoT',
          type: this.getPlanType(sub.planType),
          expiration: this.formatDate(sub.expiresAt),
          status: sub.isExpired ? 'Venció' : 'Activo',
          statusClass: sub.isExpired ? 'vencido' : 'activo',
          users: { used: sub.userCount, total: sub.userCount },
          registrationKey: sub.registrationKey  // Asegurando que se guarde el ID correcto
        }));
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las suscripciones';
        this.isLoading = false;
        console.error(error);
      }
    });
  }
  saveRegistrationKey(registrationKey: string): void {
    sessionStorage.setItem('registrationKey', registrationKey);
    this.router.navigate(['/subscriptions/detail']);
  }
  getPlanType(planType: string): string {
    switch (planType) {
      case 'free': return 'Prueba';
      case 'ilimit': return 'Ilimitado';
      case 'month':
      case 'year': return 'Pagado';
      default: return 'Desconocido';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
}
