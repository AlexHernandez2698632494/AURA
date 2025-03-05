import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';
import { PremiumSideComponent } from '../side/side.component';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-premium-users',
  imports: [CommonModule, PremiumSideComponent,MatIconModule, BottomTabComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class PremiumUsersComponent {
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
}
