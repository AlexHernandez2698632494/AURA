import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http'; // Asegúrate de que esta línea esté presente
import { HomeComponent } from './app/components/home/home.component';
import { PruebaComponent } from './app/components/prueba/prueba.component';
import { LoginComponent } from './app/components/login/login.component';
import { ForgotComponent } from './app/components/forgot/forgot.component';
//admin
import { CreateAdminComponent } from './app/components/admin/create/create.component';
import { IndexAdminComponent } from './app/components/admin/index/index.component';
import { IndexEAdminComponent } from './app/components/admin/index-e/index-e.component';

//alert
import { CreateAlertComponent } from './app/components/alert/create/create.component';
import { IndexAlertComponent } from './app/components/alert/index/index.component';
import { IndexEAlertComponent } from './app/components/alert/index-e/index-e.component';

//suscription
import { CreateSuscriptionComponent } from './app/components/suscription/create/create.component';
import { IndexSuscriptionComponent } from './app/components/suscription/index/index.component';
import { IndexESuscriptionComponent } from './app/components/suscription/index-e/index-e.component';

//service
import { CreateServiceComponent } from './app/components/service/create/create.component';
import { IndexServiceComponent } from './app/components/service/index/index.component';
import { IndexEServiceComponent } from './app/components/service/index-e/index-e.component';

//sensors
import { CreateSensorsComponent } from './app/components/sensors/create/create.component';
import { IndexSensorsComponent } from './app/components/sensors/index/index.component';
import { IndexESensorsComponent } from './app/components/sensors/index-e/index-e.component';
//session or history
import { IndexSessionComponent } from './app/components/session/index/index.component';
import { IndexESessionComponent } from './app/components/session/index-e/index-e.component';
import { IndexUsersComponent } from './app/components/users/index/index.component';

import { ChangePasswordComponent } from './app/components/change-password/change-password.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MoreComponent } from './app/components/more/more.component';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'prueba', component: PruebaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'more', component: MoreComponent},
  // { path: 'logout', component: LoginComponent },
  { path: 'recuperarView', component: ForgotComponent},
  // rutas de Admin:
  { path: 'admin/create', component: CreateAdminComponent }, 
  { path: 'admin/index', component: IndexAdminComponent },
  { path: 'admin/indexE', component: IndexEAdminComponent },
    // rutas de Alertas:
    { path: 'alert/create', component: CreateAlertComponent }, 
    { path: 'alert/index', component: IndexAlertComponent },
    { path: 'alert/indexE', component:  IndexEAlertComponent},
    // rutas de Suscripciones:
    { path: 'suscription/create', component: CreateSuscriptionComponent }, 
    { path: 'suscription/index', component: IndexSuscriptionComponent },
    { path: 'suscription/indexE', component: IndexESuscriptionComponent },
    // rutas de Servicios:
    { path: 'services/create', component: CreateServiceComponent }, 
    { path: 'services/index', component: IndexServiceComponent },
    { path: 'services/indexE', component: IndexEServiceComponent },
  // rutas de Sensores:
  { path: 'sensors/create', component: CreateSensorsComponent },
  { path: 'sensors/index', component: IndexSensorsComponent },
  { path: 'sensors/indexE', component: IndexESensorsComponent },
  // rutas de Sesiones:
  { path: 'sessions/index', component: IndexSessionComponent },
  { path: 'sessions/indexE', component: IndexESessionComponent },
  // rutas de usuarios:
  { path: 'users/index', component: IndexUsersComponent },
  { path: 'users/cambiarContra', component: ChangePasswordComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Proveer las rutas al enrutador
    provideHttpClient(), provideAnimationsAsync() // Agrega esta línea para asegurar que HttpClient esté disponible
  ],
}).catch((err) => console.error(err));
