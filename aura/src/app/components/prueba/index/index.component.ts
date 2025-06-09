import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumSideComponent } from '../../paymentUsers/side/side.component';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BottomTabComponent } from '../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, PremiumSideComponent, MatIconModule, BottomTabComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent {
  isLargeScreen: boolean = window.innerWidth > 1024;
  subscriptions: any[] = [];
  isLoading = true;
  errorMessage = '';


  @Output() bodySizeChange = new EventEmitter<boolean>();

  constructor(private paymentUserService: PaymentUserService, private router: Router) { }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  isSidebarCollapsed = true;

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}