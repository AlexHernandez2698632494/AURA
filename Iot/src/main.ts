import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Componentes
import { HomeComponent } from './app/components/home/home.component';
import { PruebaComponent } from './app/components/prueba/prueba.component';
import { LoginComponent } from './app/components/login/login.component';
import { ForgotComponent } from './app/components/forgot/forgot.component';

// Admin
import { CreateAdminComponent } from './app/components/admin/create/create.component';
import { IndexAdminComponent } from './app/components/admin/index/index.component';
import { IndexEAdminComponent } from './app/components/admin/index-e/index-e.component';

// Alert
import { CreateAlertComponent } from './app/components/alert/create/create.component';
import { IndexAlertComponent } from './app/components/alert/index/index.component';
import { IndexEAlertComponent } from './app/components/alert/index-e/index-e.component';

// Suscription
import { CreateSuscriptionComponent } from './app/components/suscription/create/create.component';
import { IndexSuscriptionComponent } from './app/components/suscription/index/index.component';
import { IndexESuscriptionComponent } from './app/components/suscription/index-e/index-e.component';

// Service
import { CreateServiceComponent } from './app/components/service/create/create.component';
import { IndexServiceComponent } from './app/components/service/index/index.component';
import { IndexEServiceComponent } from './app/components/service/index-e/index-e.component';

// Sensors
import { CreateSensorsComponent } from './app/components/sensors/create/create.component';
import { IndexSensorsComponent } from './app/components/sensors/index/index.component';
import { IndexESensorsComponent } from './app/components/sensors/index-e/index-e.component';

// Session or History
import { IndexSessionComponent } from './app/components/session/index/index.component';
import { IndexESessionComponent } from './app/components/session/index-e/index-e.component';
import { IndexUsersComponent } from './app/components/users/index/index.component';

// Misc
import { ChangePasswordComponent } from './app/components/change-password/change-password.component';
import { MoreComponent } from './app/components/more/more.component';

// Servicios y Guards
import { IdleService } from './app/services/idle-service.service';
import { AuthGuard } from './app/auth/auth.guard';
// Rutas de la aplicación
const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'prueba', component: PruebaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'more', component: MoreComponent },
  { path: 'recuperarView', component: ForgotComponent },

  // Rutas protegidas con AuthGuard
  { path: 'admin/create', component: CreateAdminComponent, canActivate: [AuthGuard] },
  { path: 'admin/index', component: IndexAdminComponent, canActivate: [AuthGuard] },
  { path: 'admin/indexE', component: IndexEAdminComponent, canActivate: [AuthGuard] },

  { path: 'alert/create', component: CreateAlertComponent, canActivate: [AuthGuard] },
  { path: 'alert/index', component: IndexAlertComponent, canActivate: [AuthGuard] },
  { path: 'alert/indexE', component: IndexEAlertComponent, canActivate: [AuthGuard] },

  { path: 'suscription/create', component: CreateSuscriptionComponent, canActivate: [AuthGuard] },
  { path: 'suscription/index', component: IndexSuscriptionComponent, canActivate: [AuthGuard] },
  { path: 'suscription/indexE', component: IndexESuscriptionComponent, canActivate: [AuthGuard] },

  { path: 'services/create', component: CreateServiceComponent, canActivate: [AuthGuard] },
  { path: 'services/index', component: IndexServiceComponent, canActivate: [AuthGuard] },
  { path: 'services/indexE', component: IndexEServiceComponent, canActivate: [AuthGuard] },

  { path: 'sensors/create', component: CreateSensorsComponent, canActivate: [AuthGuard] },
  { path: 'sensors/index', component: IndexSensorsComponent, canActivate: [AuthGuard] },
  { path: 'sensors/indexE', component: IndexESensorsComponent, canActivate: [AuthGuard] },

  { path: 'sessions/index', component: IndexSessionComponent, canActivate: [AuthGuard] },
  { path: 'sessions/indexE', component: IndexESessionComponent, canActivate: [AuthGuard] },
  { path: 'users/index', component: IndexUsersComponent, canActivate: [AuthGuard] },
  { path: 'users/cambiarContra', component: ChangePasswordComponent, canActivate: [AuthGuard] },
];

// Bootstrap de la aplicación
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    IdleService, // Registro del servicio de inactividad
    AuthGuard,   // Registro del guard para rutas protegidas
  ],
})
  .then((appRef) => {
    const idleService = appRef.injector.get(IdleService);
    idleService.startWatching(); // Inicia el monitoreo de inactividad
  })
  .catch((err) => console.error(err));
