import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/components/home/home.component';
import { PruebaComponent } from './app/components/prueba/prueba.component';
import { LoginComponent } from './app/components/login/login.component';
import { ForgotComponent } from './app/components/forgot/forgot.component';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'prueba', component: PruebaComponent },
  { path: 'login', component: LoginComponent },
  // Agregar rutas para los enlaces del menú:
  { path: 'admin/create', component: HomeComponent }, 
  { path: 'admin/index', component: PruebaComponent },
  { path: 'admin/indexE', component: PruebaComponent },
  { path: 'sensors/create', component: PruebaComponent },
  { path: 'sensors/index', component: PruebaComponent },
  { path: 'sensors/indexE', component: PruebaComponent },
  { path: 'sessions/index', component: PruebaComponent },
  { path: 'sessions/indexE', component: PruebaComponent },
  { path: 'users/index', component: PruebaComponent },
  { path: 'users/cambiarContra', component: PruebaComponent },
  { path: 'logout', component: LoginComponent },
  { path: 'recuperarView', component: ForgotComponent}
];


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Proveer las rutas al enrutador
  ],
}).catch((err) => console.error(err));