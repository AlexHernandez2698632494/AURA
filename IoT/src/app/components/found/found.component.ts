import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-found',
  imports: [RouterOutlet,NavComponent],
  templateUrl: './found.component.html',
  styleUrl: './found.component.css'
})
export class FoundComponent {

}
