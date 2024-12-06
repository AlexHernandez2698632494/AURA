import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { HomeComponent } from './app/components/home/home.component';
import { PruebaComponent } from './app/components/prueba/prueba.component';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' }, // Redirige por defecto
  { path: 'Home', component: HomeComponent }, // Define la ruta para el componente por defecto
  { path: 'prueba', component: PruebaComponent }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Proveer las rutas al enrutador
  ],
}).catch((err) => console.error(err));