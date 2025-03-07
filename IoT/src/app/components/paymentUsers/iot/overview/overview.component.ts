import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PremiumSideComponent } from '../../side/side.component';
import { BottomTabComponent } from '../../../bottom-tab/bottom-tab.component';
import { PaymentUserService } from '../../../../services/paymentUser/payment-user.service';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, PremiumSideComponent,BottomTabComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewIoTComponent implements OnInit{
    isLargeScreen: boolean = window.innerWidth > 1024;
    @Output() bodySizeChange = new EventEmitter<boolean>();
    isSidebarCollapsed = true;
    
    subscriptionsCount: number = 0;
    subscriptionsList: { name: string; isExpired: boolean }[] = []; // Definir correctamente el array
    usersCount: number = 0;
  
    constructor(private paymentUserService: PaymentUserService) {}
  
  ngOnInit(): void {
      
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth > 1024;
  }

  onSideNavToggle(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
