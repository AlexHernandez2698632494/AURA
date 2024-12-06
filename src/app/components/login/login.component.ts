import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideComponent } from '../side/side.component';
import { SideLoginComponent } from "../side-login/side-login.component";

@Component({
  selector: 'app-prueba',
  imports: [RouterOutlet, SideComponent, SideLoginComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  title = 'login';
}
