import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FamiliaService } from '../../../core/services/familia.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, BadgeModule, AvatarModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="layout-wrapper">
      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Logo -->
        <div class="sidebar-logo">
          <div class="logo-icon">K</div>
          <div>
            <div class="logo-title">KatchUp</div>
            <div class="logo-sub">Finanzas Familiares</div>
          </div>
        </div>

        <!-- Nav -->
        <nav class="sidebar-nav">
          <div class="nav-section-label">PRINCIPAL</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <i class="pi pi-th-large"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/gastos" routerLinkActive="active" class="nav-item">
            <i class="pi pi-wallet"></i>
            <span>Gastos</span>
          </a>
          <a routerLink="/metas-ahorro" routerLinkActive="active" class="nav-item">
            <i class="pi pi-bullseye"></i>
            <span>Metas de Ahorro</span>
          </a>
          <a routerLink="/simulador" routerLinkActive="active" class="nav-item">
            <i class="pi pi-chart-bar"></i>
            <span>Simulador</span>
          </a>

          <div class="nav-section-label" style="margin-top:1.5rem">CONFIGURACIÓN</div>
          <a routerLink="/reglas-automaticas" routerLinkActive="active" class="nav-item">
            <i class="pi pi-bolt"></i>
            <span>Reglas Automáticas</span>
          </a>
          <a routerLink="/familia" routerLinkActive="active" class="nav-item">
            <i class="pi pi-users"></i>
            <span>Familia</span>
          </a>
        </nav>

        <!-- User info -->
        <div class="sidebar-user" (click)="logout()">
          <p-avatar
            [label]="userInitial"
            styleClass="user-avatar"
            shape="circle"
          />
          <div class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-action">Cerrar sesión</div>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <!-- Top bar -->
        <header class="topbar">
          <div class="search-box">
            <i class="pi pi-search"></i>
            <input type="text" placeholder="Buscar transacciones, metas..." />
          </div>
          <div class="topbar-actions">
            <div class="notif-btn" (click)="toggleNotif()">
              <i class="pi pi-bell"></i>
              <span class="notif-badge" *ngIf="notiCount > 0">{{ notiCount }}</span>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <div class="page-content">
          <router-outlet />
        </div>
      </main>
    </div>

    <p-toast />
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: #f8f9fa;
    }

    /* Sidebar */
    .sidebar {
      width: 220px;
      min-width: 220px;
      background: #1a3a2e;
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0;
      color: #fff;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: #2d9c6f;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .logo-title { font-weight: 700; font-size: 1rem; line-height: 1.2; }
    .logo-sub { font-size: 0.7rem; color: rgba(255,255,255,0.5); }

    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .nav-section-label {
      font-size: 0.65rem;
      color: rgba(255,255,255,0.4);
      letter-spacing: 0.08em;
      padding: 0 0.5rem;
      margin-bottom: 0.4rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      font-size: 0.875rem;
      transition: all 0.15s;
      cursor: pointer;
    }

    .nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
    .nav-item.active { background: #2d9c6f; color: #fff; }
    .nav-item i { font-size: 0.95rem; width: 16px; }

    .sidebar-user {
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }

    .user-name { font-size: 0.8rem; font-weight: 600; color: #fff; }
    .user-action { font-size: 0.7rem; color: rgba(255,255,255,0.4); }

    /* Main */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      height: 56px;
      background: #fff;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      gap: 1rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f1f3f5;
      border-radius: 8px;
      padding: 0.4rem 0.75rem;
      flex: 1;
      max-width: 380px;
    }
    .search-box i { color: #adb5bd; font-size: 0.85rem; }
    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.875rem;
      color: #495057;
      width: 100%;
    }

    .topbar-actions { display: flex; align-items: center; gap: 1rem; }

    .notif-btn {
      position: relative;
      cursor: pointer;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f1f3f5;
    }
    .notif-btn i { font-size: 1rem; color: #495057; }
    .notif-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #e53e3e;
      color: #fff;
      font-size: 0.6rem;
      font-weight: 700;
      border-radius: 10px;
      padding: 1px 4px;
      min-width: 16px;
      text-align: center;
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.75rem 2rem;
    }
  `],
})
export class LayoutComponent implements OnInit {
  notiCount = 0;

  constructor(
    private auth: AuthService,
    private familiaService: FamiliaService,
    private notiService: NotificacionesService,
  ) {}

  get userName() { return this.auth.currentUser()?.nombre_completo ?? ''; }
  get userInitial() { return this.userName.charAt(0).toUpperCase(); }

  ngOnInit() {
    this.familiaService.misFamilias().subscribe();
    this.notiService.contarNoLeidas().subscribe((r) => (this.notiCount = r.count));
  }

  logout() { this.auth.logout(); }
  toggleNotif() {}
}
