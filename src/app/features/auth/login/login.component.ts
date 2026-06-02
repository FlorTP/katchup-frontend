import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputTextModule, ButtonModule, MessageModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="brand">
          <div class="brand-icon">K</div>
          <div>
            <div class="brand-name">KatchUp</div>
            <div class="brand-sub">Finanzas Familiares</div>
          </div>
        </div>
        <div class="auth-tagline">
          <h1>Toma el control de las finanzas de tu familia</h1>
          <p>Registra gastos, define metas de ahorro y proyecta tu futuro financiero.</p>
        </div>
        <div class="auth-stats">
          <div class="stat"><span class="stat-val">65%</span><span class="stat-label">Tasa de ahorro promedio</span></div>
          <div class="stat"><span class="stat-val">S/ 6,370</span><span class="stat-label">Ahorro mensual típico</span></div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">
          <h2>Iniciar sesión</h2>
          <p class="auth-desc">Ingresa a tu cuenta familiar</p>

          <div class="alert-error" *ngIf="error">
            <i class="pi pi-exclamation-circle"></i> {{ error }}
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-envelope"></i>
              <input pInputText [(ngModel)]="correo" type="email"
                placeholder="correo@ejemplo.com" class="w-full" />
            </span>
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <span class="p-input-icon-left w-full">
              <i class="pi pi-lock"></i>
              <input pInputText [(ngModel)]="password"
                [type]="showPass ? 'text' : 'password'"
                placeholder="••••••••" class="w-full" />
            </span>
            <span class="show-pass" (click)="showPass = !showPass">
              {{ showPass ? 'Ocultar' : 'Mostrar' }}
            </span>
          </div>

          <button pButton label="Ingresar" [loading]="loading"
            class="btn-primary w-full" (click)="login()"></button>

          <div class="auth-footer">
            ¿No tienes cuenta?
            <a routerLink="/auth/register">Regístrate aquí</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
    }

    .auth-left {
      flex: 1;
      background: #1a3a2e;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: #fff;
    }

    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon {
      width: 44px; height: 44px;
      background: #2d9c6f;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1.3rem;
    }
    .brand-name { font-weight: 700; font-size: 1.2rem; }
    .brand-sub { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

    .auth-tagline h1 {
      font-size: 2rem; font-weight: 700;
      line-height: 1.3; margin-bottom: 1rem;
    }
    .auth-tagline p { color: rgba(255,255,255,0.65); font-size: 1rem; line-height: 1.6; }

    .auth-stats { display: flex; gap: 2rem; }
    .stat { display: flex; flex-direction: column; gap: 0.25rem; }
    .stat-val { font-size: 1.75rem; font-weight: 700; color: #2d9c6f; }
    .stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.5); }

    .auth-right {
      width: 460px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      padding: 2rem;
    }

    .auth-card {
      background: #fff;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }

    .auth-card h2 { font-size: 1.5rem; font-weight: 700; color: #1a3a2e; margin-bottom: 0.25rem; }
    .auth-desc { color: #6c757d; margin-bottom: 1.75rem; font-size: 0.9rem; }

    .alert-error {
      background: #fff5f5; border: 1px solid #fed7d7;
      color: #c53030; border-radius: 8px;
      padding: 0.75rem 1rem; margin-bottom: 1.25rem;
      font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;
    }

    .form-group { margin-bottom: 1.25rem; }
    .form-group label {
      display: block; font-size: 0.875rem;
      font-weight: 600; color: #374151;
      margin-bottom: 0.4rem;
    }
    .form-group .p-inputtext { border-radius: 8px !important; }

    .show-pass {
      font-size: 0.75rem; color: #2d9c6f;
      cursor: pointer; float: right; margin-top: 0.3rem;
    }

    .btn-primary {
      background: #2d9c6f !important;
      border-color: #2d9c6f !important;
      border-radius: 8px !important;
      height: 44px;
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.875rem;
      color: #6c757d;
    }
    .auth-footer a { color: #2d9c6f; font-weight: 600; text-decoration: none; margin-left: 0.25rem; }
  `],
})
export class LoginComponent {
  correo = '';
  password = '';
  showPass = false;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.correo || !this.password) {
      this.error = 'Completa todos los campos';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.correo, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.error = e?.error?.message ?? 'Credenciales incorrectas';
        this.loading = false;
      },
    });
  }
}
