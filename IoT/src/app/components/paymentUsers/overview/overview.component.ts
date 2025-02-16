import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, BottomTabComponent, RouterOutlet],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  @Output() bodySizeChange = new EventEmitter<boolean>();
  isSidebarCollapsed = true;
  
  subscriptionsCount: number = 0;
  subscriptionsList: string[] = [];
  usersCount: number = 0;

  constructor(private paymentUserService: PaymentUserService) {}

  ngOnInit(): void {
    this.loadUserSubscriptions();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }

  private loadUserSubscriptions(): void {
    const username = sessionStorage.getItem('usuario'); // Se obtiene el username correcto
    if (!username) {
      console.error('No username found in sessionStorage');
      return;
    }

    this.paymentUserService.getUserSubscriptions(username).subscribe(
      (response) => {
        if (response.registrationKeys) {
          this.subscriptionsCount = response.registrationKeys.length;
          this.subscriptionsList = response.registrationKeys.map(() => 'Gestión de dispositivos IoT');
        }
        if (response.registrationKeys.length > 0) {
          this.usersCount = response.registrationKeys[0].userCount || 0;
        }
      },
      (error) => {
        console.error('Error loading user subscriptions:', error);
      }
    );
  }
}
