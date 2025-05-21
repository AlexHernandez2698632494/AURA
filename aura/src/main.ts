import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { ToastrModule } from 'ngx-toastr'; // ✅ Importa ToastrModule aquí
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
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
import { SubscriptionsComponent } from './app/components/paymentUsers/subscriptions/subscriptions.component';
import { SubscriptionsDetailsComponent } from './app/components/paymentUsers/details/details.component';
import { OverviewComponent } from './app/components/paymentUsers/overview/overview.component';
import { CreatePaymetUserComponent } from './app/components/paymentUsers/create/create.component';
import { OverviewIoTComponent } from './app/components/paymentUsers/iot/overview/overview.component';
import { PremiumUsersComponent } from './app/components/paymentUsers/users/users.component';
import { BuildingsComponent } from './app/components/paymentUsers/iot/buildings/buildings.component';
import { BuildingsCreateComponent } from './app/components/paymentUsers/iot/buildings/create/create.component';
import { BuildingIndexComponent } from './app/components/paymentUsers/iot/buildings/index/index.component';
import { BuildingUpdateComponent } from './app/components/paymentUsers/iot/buildings/update/update.component';
import { BuildingBranchComponent } from './app/components/paymentUsers/iot/buildings/branch/branch.component';
import { BuildingBranchCreateComponent } from './app/components/paymentUsers/iot/buildings/branch/create/create.component';
import { BuildingBranchIndexComponent } from './app/components/paymentUsers/iot/buildings/branch/index/index.component';
import { DeviceComponent } from './app/components/paymentUsers/iot/fiware/device/device.component';
import { DetailsDeviceComponent } from './app/components/paymentUsers/iot/buildings/branch/index/details/details.component';
import { PremiumUsersCreateComponent } from './app/components/paymentUsers/users/create/create.component';
import { KeyIndexComponent } from './app/components/key/index/index.component';
import { KeyCreateComponent } from './app/components/key/create/create.component';

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
  {
    path: 'key/index',
    component: KeyIndexComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_administrador', 'dev'] },
  },
  {
    path: 'key/create',
    component: KeyCreateComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_administrador', 'dev'] },
  },
  // rutas de Subscriptions o Usuarios con permisos de licencia :
  {
    path:'overview',
    component:OverviewComponent,
    canActivate:[AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
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
    path: 'premium/user/create',
    component: CreatePaymetUserComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_administrador', 'dev'] },
  },

  {
    path: 'premium/iot/overview',
    component: OverviewIoTComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path: 'premium/users',
    component: PremiumUsersComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path: 'premium/users/create',
    component: PremiumUsersCreateComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building',
    component: BuildingsComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },

  {
    path:'premium/building/create',
    component: BuildingsCreateComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/index/:id',
    component: BuildingIndexComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/update',
    component: BuildingUpdateComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/:buildingName/branch/:id',
    component: BuildingBranchComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/:buildingName/branch/:id/create',
    component: BuildingBranchCreateComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/:buildingName/level/:id/branch/:branchName',
    component: BuildingBranchIndexComponent,
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/:buildingName/level/:id/branch/:branchName/create/devices',
    component: DeviceComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  },
  {
    path:'premium/building/:buildingName/level/:id/branch/:branchName/:deviceName',
    component: DetailsDeviceComponent,
    canActivate: [AuthGuard],
    data: { authorities: ['super_usuario'] },
  }
  ,
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
    provideAnimations(), // required animations providers
    provideToastr(), // Toastr providers
  ],
}).catch((err) => console.error(err));
