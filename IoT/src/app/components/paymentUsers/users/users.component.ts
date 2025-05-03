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
export class PremiumUsersComponent implements OnInit {
  isLargeScreen: boolean = window.innerWidth > 1024;
  subscriptions: any[] = [];
  isLoading = true;
  errorMessage = '';
  users: any[] = [];  // Aquí almacenaremos la lista de usuarios

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

  goToCreateUser() {
    this.router.navigate(['premium/users/create']);
  }

  ngOnInit(): void {
    // Puedes obtener los valores de authorityId y registrationKeyId desde donde sea necesario, por ejemplo, sessionStorage o pasarlos como parámetros.
    const authorityId = '6814d5eb49a46961238169a3';
    const registrationKeyId = '6814d5eb49a46961238169a8';

    this.loadUsers(authorityId, registrationKeyId);
  }

  loadUsers(authorityId: string, registrationKeyId: string): void {
    this.isLoading = true;
  
    this.paymentUserService.getUsersWithFilters(authorityId, registrationKeyId).subscribe({
      next: (usersData) => {
        console.log('Lista de usuarios:', usersData);
        this.users = usersData;  // Guardamos los usuarios en la variable
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.isLoading = false;
        this.errorMessage = 'Error al cargar la lista de usuarios.';
      }
    });
  }
}
