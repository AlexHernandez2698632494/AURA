import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideComponent } from '../side/side.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [RouterOutlet, SideComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  constructor(private router: Router){}
  onSubmit() {
    alert('Contraseña cambiada exitosamente');
  }
  onBackClick():void{
    this.router.navigate(['/admin/index']);
  }
}
