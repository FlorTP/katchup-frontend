import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FamiliaService } from '../../../core/services/familia.service';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InputTextModule, ButtonModule],
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
          <h1>Empieza hoy a ahorrar en familia</h1>
          <p>Crea tu cuenta, crea tu familia o únete a una existente con un código de invitación.</p>
        </div>
        <div class="steps">
          <div class="step" [class.step-active]="step === 1">
            <div class="step-num">1</div><span>Crea tu cuenta</span>
          </div>
          <div class="step" [class.step-active]="step === 2">
            <div class="step-num">2</div><span>Familia o código de invitación</span>
          </div>
          <div class="step" [class.step-active]="step === 3">
            <div class="step-num">3</div><span>¡Listo para empezar!</span>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card">

          <!-- STEP 1 -->
          <ng-container *ngIf="step === 1">
            <h2>Crear cuenta</h2>
            <p class="auth-desc">Ingresa tus datos personales</p>
            <div class="alert-error" *ngIf="error"><i class="pi pi-exclamation-circle"></i> {{ error }}</div>
            <div class="form-group">
              <label>Nombre completo</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-user"></i>
                <input pInputText [(ngModel)]="nombre" placeholder="Tu nombre completo" class="w-full" />
              </span>
            </div>
            <div class="form-group">
              <label>Correo electrónico</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-envelope"></i>
                <input pInputText [(ngModel)]="correo" type="email" placeholder="correo@ejemplo.com" class="w-full" />
              </span>
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-lock"></i>
                <input pInputText [(ngModel)]="password" [type]="showPass ? 'text' : 'password'" placeholder="Mínimo 6 caracteres" class="w-full" />
              </span>
              <span class="show-pass" (click)="showPass = !showPass">{{ showPass ? 'Ocultar' : 'Mostrar' }}</span>
            </div>
            <button pButton label="Continuar" [loading]="loading" class="btn-primary w-full" (click)="registrar()"></button>
          </ng-container>

          <!-- STEP 2 -->
          <ng-container *ngIf="step === 2">
            <h2>Tu grupo familiar</h2>
            <p class="auth-desc">¿Creas una familia nueva o ya tienes un código de invitación?</p>
            <div class="alert-error" *ngIf="error"><i class="pi pi-exclamation-circle"></i> {{ error }}</div>
            <div class="tabs">
              <button class="tab" [class.tab-active]="tab === 'crear'" (click)="tab = 'crear'">
                <i class="pi pi-home"></i> Crear familia
              </button>
              <button class="tab" [class.tab-active]="tab === 'unirse'" (click)="tab = 'unirse'">
                <i class="pi pi-key"></i> Tengo un código
              </button>
            </div>
            <ng-container *ngIf="tab === 'crear'">
              <div class="form-group">
                <label>Nombre de tu familia</label>
                <span class="p-input-icon-left w-full">
                  <i class="pi pi-users"></i>
                  <input pInputText [(ngModel)]="nombreFamilia" placeholder="Ej: Familia Mendoza" class="w-full" />
                </span>
              </div>
              <div class="info-tip">
                <i class="pi pi-info-circle"></i>
                Serás el <strong>administrador</strong>. Podrás compartir tu código de invitación con otros miembros desde la sección Familia.
              </div>
              <button pButton label="Crear familia y entrar" [loading]="loading" class="btn-primary w-full" (click)="crearFamilia()"></button>
            </ng-container>
            <ng-container *ngIf="tab === 'unirse'">
              <div class="form-group">
                <label>Código de invitación</label>
                <span class="p-input-icon-left w-full">
                  <i class="pi pi-key"></i>
                  <input pInputText [(ngModel)]="codigoInvitacion" placeholder="Ej: FAM-ABC123" class="w-full code-input" (input)="codigoInvitacion = codigoInvitacion.toUpperCase()" />
                </span>
              </div>
              <div class="info-tip">
                <i class="pi pi-info-circle"></i>
                Pídele el código al administrador de tu familia. Lo encontrará en <strong>Familia → Código de invitación</strong>.
              </div>
              <button pButton label="Unirme a la familia" [loading]="loading" class="btn-primary w-full" (click)="unirseConCodigo()"></button>
            </ng-container>
          </ng-container>

          <!-- STEP 3 -->
          <ng-container *ngIf="step === 3">
            <div class="success-screen">
              <div class="success-icon"><i class="pi pi-check"></i></div>
              <h2>¡Todo listo!</h2>
              <p>Tu cuenta está creada y ya formas parte de <strong>{{ familiaUnida }}</strong>.</p>
              <button pButton label="Ir al Dashboard" class="btn-primary w-full" (click)="irAlDashboard()"></button>
            </div>
          </ng-container>

          <div class="auth-footer" *ngIf="step !== 3">
            ¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; display: flex; }
    .auth-left { flex: 1; background: #1a3a2e; padding: 3rem; display: flex; flex-direction: column; justify-content: space-between; color: #fff; }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .brand-icon { width: 44px; height: 44px; background: #2d9c6f; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.3rem; }
    .brand-name { font-weight: 700; font-size: 1.2rem; }
    .brand-sub { font-size: 0.75rem; color: rgba(255,255,255,0.5); }
    .auth-tagline h1 { font-size: 2rem; font-weight: 700; line-height: 1.3; margin-bottom: 1rem; }
    .auth-tagline p { color: rgba(255,255,255,0.65); font-size: 1rem; line-height: 1.6; }
    .steps { display: flex; flex-direction: column; gap: 0.75rem; }
    .step { display: flex; align-items: center; gap: 0.75rem; opacity: 0.4; transition: opacity 0.2s; }
    .step.step-active { opacity: 1; }
    .step-num { width: 28px; height: 28px; background: #2d9c6f; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
    .step span { font-size: 0.9rem; }
    .auth-right { width: 490px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; padding: 2rem; }
    .auth-card { background: #fff; border-radius: 16px; padding: 2.5rem; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .auth-card h2 { font-size: 1.5rem; font-weight: 700; color: #1a3a2e; margin-bottom: 0.25rem; }
    .auth-desc { color: #6c757d; margin-bottom: 1.75rem; font-size: 0.9rem; }
    .alert-error { background: #fff5f5; border: 1px solid #fed7d7; color: #c53030; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
    .show-pass { font-size: 0.75rem; color: #2d9c6f; cursor: pointer; float: right; margin-top: 0.3rem; }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; background: #f3f4f6; border-radius: 10px; padding: 4px; }
    .tab { flex: 1; padding: 0.55rem; border: none; background: transparent; border-radius: 8px; font-size: 0.825rem; font-weight: 600; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem; transition: all 0.15s; }
    .tab.tab-active { background: #fff; color: #1a3a2e; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .info-tip { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.8rem; color: #166534; margin-bottom: 1.25rem; display: flex; align-items: flex-start; gap: 0.5rem; line-height: 1.5; }
    .info-tip i { flex-shrink: 0; margin-top: 0.1rem; }
    .code-input { font-family: monospace !important; font-size: 1.1rem !important; letter-spacing: 0.15em; text-align: center; }
    .btn-primary { background: #2d9c6f !important; border-color: #2d9c6f !important; border-radius: 8px !important; height: 44px; font-weight: 600; margin-top: 0.25rem; }
    .success-screen { text-align: center; padding: 1rem 0; }
    .success-icon { width: 72px; height: 72px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
    .success-icon i { font-size: 2rem; color: #16a34a; }
    .success-screen h2 { font-size: 1.5rem; font-weight: 700; color: #1a3a2e; margin-bottom: 0.5rem; }
    .success-screen p { color: #6c757d; margin-bottom: 1.75rem; line-height: 1.6; }
    .auth-footer { text-align: center; margin-top: 1.5rem; font-size: 0.875rem; color: #6c757d; }
    .auth-footer a { color: #2d9c6f; font-weight: 600; text-decoration: none; margin-left: 0.25rem; }
  `],
})
export class RegisterComponent {
  step = 1;
  tab: 'crear' | 'unirse' = 'crear';
  nombre = ''; correo = ''; password = '';
  nombreFamilia = ''; codigoInvitacion = ''; familiaUnida = '';
  showPass = false; loading = false; error = '';

  constructor(private auth: AuthService, private familiaService: FamiliaService, private router: Router) {}

  registrar() {
    if (!this.nombre || !this.correo || !this.password) { this.error = 'Completa todos los campos'; return; }
    if (this.password.length < 6) { this.error = 'La contraseña debe tener al menos 6 caracteres'; return; }
    this.loading = true; this.error = '';
    this.auth.register(this.nombre, this.correo, this.password).subscribe({
      next: () => { this.loading = false; this.step = 2; },
      error: (e) => { this.error = e?.error?.message ?? 'Error al registrar'; this.loading = false; },
    });
  }

  crearFamilia() {
    if (!this.nombreFamilia.trim()) { this.error = 'Ingresa el nombre de tu familia'; return; }
    this.loading = true; this.error = '';
    this.familiaService.crearFamilia(this.nombreFamilia).subscribe({
      next: (f) => { this.familiaUnida = f.nombre; this.loading = false; this.step = 3; },
      error: (e) => { this.error = e?.error?.message ?? 'Error al crear familia'; this.loading = false; },
    });
  }

  unirseConCodigo() {
    if (!this.codigoInvitacion.trim()) { this.error = 'Ingresa el código de invitación'; return; }
    this.loading = true; this.error = '';
    this.familiaService.unirseConCodigo(this.codigoInvitacion.trim()).subscribe({
      next: (res: any) => { this.familiaUnida = res.familia?.nombre ?? 'tu familia'; this.loading = false; this.step = 3; },
      error: (e) => { this.error = e?.error?.message ?? 'Código inválido o expirado'; this.loading = false; },
    });
  }

  irAlDashboard() { this.router.navigate(['/dashboard']); }
}
