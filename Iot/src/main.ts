import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AboutUsComponent } from './app/components/about-us/about-us.component';
import { HomeComponent } from './app/components/home/home.component';
import { PruebaComponent } from './app/components/prueba/prueba.component';
import { LoginComponent } from './app/components/login/login.component';
import { RegisterComponent } from './app/components/register/register.component';
import { ForgotComponent } from './app/components/forgot/forgot.component';
// admin
import { CreateAdminComponent } from './app/components/admin/create/create.component';
import { IndexAdminComponent } from './app/components/admin/index/index.component';
import { IndexEAdminComponent } from './app/components/admin/index-e/index-e.component';
// alert
import { CreateAlertComponent } from './app/components/alert/create/create.component';
import { IndexAlertComponent } from './app/components/alert/index/index.component';
import { IndexEAlertComponent } from './app/components/alert/index-e/index-e.component';
// subscription
import { CreateSuscriptionComponent } from './app/components/suscription/create/create.component';
import { IndexSuscriptionComponent } from './app/components/suscription/index/index.component';
import { IndexESuscriptionComponent } from './app/components/suscription/index-e/index-e.component';
// service
import { CreateServiceComponent } from './app/components/service/create/create.component';
import { IndexServiceComponent } from './app/components/service/index/index.component';
import { IndexEServiceComponent } from './app/components/service/index-e/index-e.component';
// sensors
import { CreateSensorsComponent } from './app/components/sensors/create/create.component';
import { IndexSensorsComponent } from './app/components/sensors/index/index.component';
import { IndexESensorsComponent } from './app/components/sensors/index-e/index-e.component';
// session or history
import { IndexSessionComponent } from './app/components/session/index/index.component';
import { IndexESessionComponent } from './app/components/session/index-e/index-e.component';
import { IndexUsersComponent } from './app/components/users/index/index.component';
import { ChangePasswordComponent } from './app/components/change-password/change-password.component';
import { MoreComponent } from './app/components/more/more.component';
import { AuthGuard } from './app/auth/auth.guard';
import { ForbiddenComponent } from './app/components/forbidden/forbidden.component';
import { FoundComponent } from './app/components/found/found.component';
import { FirsSuperAdminComponent } from './app/components/firs-super-admin/firs-super-admin.component';
import { SubscriptionsComponent } from './app/components/subscriptions/subscriptions.component';
import { SubscriptionsDetailsComponent } from './app/components/subscriptions/details/details.component';

const routes: Routes = [
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: HomeComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'prueba', component: PruebaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registrate', component: RegisterComponent},
  { path: 'register-superadmin', component: FirsSuperAdminComponent },
  { path: 'more', component: MoreComponent },
  { path: 'recuperarView', component: ForgotComponent },
  // rutas de Admin:
  {
    path: 'admin/create',
    component: CreateAdminComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['create_users', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'admin/index',
    component: IndexAdminComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['list_users', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'admin/restore/index',
    component: IndexEAdminComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['restore_user', 'super_administrador', 'administrador', 'dev'] },
  },
  // rutas de Alertas:
  {
    path: 'alert/create',
    component: CreateAlertComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['create_alert', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'alert/index',
    component: IndexAlertComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['list_alert', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'alert/indexE',
    component: IndexEAlertComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['restore_alert', 'super_administrador', 'administrador', 'dev'] },
  },
  // rutas de Suscripciones:
  {
    path: 'suscription/create',
    component: CreateSuscriptionComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['create_suscription', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'suscription/index',
    component: IndexSuscriptionComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['list_suscriptions', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'suscription/indexE',
    component: IndexESuscriptionComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['restore_suscription', 'super_administrador', 'administrador', 'dev'] },
  },
  // rutas de Servicios:
  {
    path: 'services/create',
    component: CreateServiceComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['create_iot_service', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'services/index',
    component: IndexServiceComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['list_iot_service', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'services/indexE',
    component: IndexEServiceComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['restore_iot_service', 'super_administrador', 'administrador', 'dev'] },
  },
  // rutas de Sensores:
  {
    path: 'sensors/create',
    component: CreateSensorsComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['create_sensors', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'sensors/index',
    component: IndexSensorsComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['list_sensors', 'super_administrador', 'administrador', 'dev'] },
  },
  {
    path: 'sensors/indexE',
    component: IndexESensorsComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['restore_sensors', 'super_administrador', 'administrador', 'dev'] },
  },
  // rutas de Sesiones:
  {
    path: 'sessions/index',
    component: IndexSessionComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_administrador', 'dev'] },
  },
  {
    path: 'sessions/indexE',
    component: IndexESessionComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_administrador', 'dev'] },
  },
  // rutas de Usuarios:
  {
    path: 'users/index',
    component: IndexUsersComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_administrador', 'dev'] },
  },
  // rutas de Subscriptions o Usuarios con permisos de licencia :
  {
    path: 'subscriptions',
    component: SubscriptionsComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path: 'subscriptions/detail',
    component: SubscriptionsDetailsComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path: 'users/cambiarContra',
    component: ChangePasswordComponent,
  },
  // Ruta para 403 Forbidden
  { path: '403', component: ForbiddenComponent },

  // Ruta comodín para 404 Not Found
  { path: '**', component: FoundComponent },];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
