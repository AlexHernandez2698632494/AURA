import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/components/home/home.component';
import { PruebaComponent } from './app/components/prueba/prueba.component';
import { LoginComponent } from './app/components/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'prueba', component: PruebaComponent },
  { path: 'login', component: LoginComponent },
  // Agregar rutas para los enlaces del menú:
  { path: 'registrar/administrador', component: HomeComponent }, 
  { path: 'control/administrador', component: PruebaComponent },
  { path: 'eliminados/administradores', component: PruebaComponent },
  { path: 'registrar/sensor', component: PruebaComponent },
  { path: 'control/sensores', component: PruebaComponent },
  { path: 'eliminados/sensores', component: PruebaComponent },
  { path: 'control/sesiones', component: PruebaComponent },
  { path: 'eliminados/sesiones', component: PruebaComponent },
  { path: 'control/usuarios', component: PruebaComponent },
  { path: 'cambiar-contraseña', component: PruebaComponent },
  { path: 'logout', component: LoginComponent }
];


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Proveer las rutas al enrutador
  ],
}).catch((err) => console.error(err));