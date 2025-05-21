// notification.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  constructor(private toastr: ToastrService) {}

  // Método para mostrar el toast
  showAlert(message: string, title: string, level: number): void {
    let toastClass = '';
    if (level === 4) {
      toastClass = 'toast-warning';
    } else if (level === 5) {
      toastClass = 'toast-error';
    }

    // Mostrar el Toast
    this.toastr.show(message, title, {
      timeOut: 5000,
      closeButton: true,
      progressBar: true,
      positionClass: 'toast-top-right',
      toastClass: `ngx-toastr ${toastClass}`,
    });
  }
}
