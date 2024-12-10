import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideLoginComponent } from "../side-login/side-login.component";

@Component({
  selector: 'app-forgot',
  imports: [RouterOutlet,SideLoginComponent],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.css'
})
export class ForgotComponent {
  title = 'Forgot'
}
