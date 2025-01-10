import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-about-us',
  imports: [RouterOutlet, NavComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {

}
