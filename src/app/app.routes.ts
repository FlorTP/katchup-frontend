import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Redirigir raíz
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Rutas públicas (solo si NO está autenticado)
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // Layout principal protegido
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'gastos',
        loadComponent: () =>
          import('./features/gastos/gastos.component').then((m) => m.GastosComponent),
      },
      {
        path: 'metas-ahorro',
        loadComponent: () =>
          import('./features/metas-ahorro/metas-ahorro.component').then((m) => m.MetasAhorroComponent),
      },
      {
        path: 'simulador',
        loadComponent: () =>
          import('./features/simulador/simulador.component').then((m) => m.SimuladorComponent),
      },
      {
        path: 'reglas-automaticas',
        loadComponent: () =>
          import('./features/reglas-automaticas/reglas-automaticas.component').then((m) => m.ReglasAutomaticasComponent),
      },
      {
        path: 'familia',
        loadComponent: () =>
          import('./features/familia/familia.component').then((m) => m.FamiliaComponent),
      },
    ],
  },

  { path: '**', redirectTo: '/dashboard' },
];
