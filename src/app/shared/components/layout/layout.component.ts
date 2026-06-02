import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FamiliaService } from '../../../core/services/familia.service';
import { NotificacionesService } from '../../../core/services/notificaciones.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, ToastModule],
  providers: [MessageService],
  template: `
    <div class="layout-wrapper">
      <div class="sidebar-overlay" (click)="sidebarOpen = false" *ngIf="sidebarOpen"></div>
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-logo">
          <div class="logo-icon">K</div>
          <div class="logo-text">
            <div class="logo-title">KatchUp</div>
            <div class="logo-sub">Finanzas Familiares</div>
          </div>
          <button class="sidebar-close" (click)="sidebarOpen = false"><i class="pi pi-times"></i></button>
        </div>
        <nav class="sidebar-nav">
          <div class="nav-label">PRINCIPAL</div>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><i class="pi pi-th-large"></i><span>Dashboard</span></a>
          <a routerLink="/gastos" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><i class="pi pi-wallet"></i><span>Movimientos</span></a>
          <a routerLink="/metas-ahorro" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><i class="pi pi-bullseye"></i><span>Metas de Ahorro</span></a>
          <a routerLink="/simulador" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><i class="pi pi-chart-bar"></i><span>Simulador</span></a>
          <div class="nav-label mt">CONFIGURACIÓN</div>
          <a routerLink="/reglas-automaticas" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><i class="pi pi-bolt"></i><span>Reglas Automáticas</span></a>
          <a routerLink="/familia" routerLinkActive="active" class="nav-item" (click)="closeSidebar()"><i class="pi pi-users"></i><span>Familia</span></a>
        </nav>
        <div class="sidebar-user" (click)="logout()">
          <div class="user-avatar">{{ userInitial }}</div>
          <div><div class="user-name">{{ userName }}</div><div class="user-action">Cerrar sesión</div></div>
        </div>
      </aside>
      <main class="main-content">
        <header class="topbar">
          <button class="menu-btn" (click)="sidebarOpen = true"><i class="pi pi-bars"></i></button>
          <div class="topbar-brand"><div class="logo-icon-sm">K</div><span>KatchUp</span></div>
          <div class="search-box"><i class="pi pi-search"></i><input type="text" placeholder="Buscar transacciones, metas..." /></div>
          <div class="notif-btn"><i class="pi pi-bell"></i><span class="notif-badge" *ngIf="notiCount > 0">{{ notiCount }}</span></div>
        </header>
        <div class="page-content"><router-outlet /></div>
      </main>
    </div>
    <p-toast />
  `,
  styles: [`
    .layout-wrapper{display:flex;height:100vh;overflow:hidden;background:#f8f9fa}
    .sidebar{width:220px;min-width:220px;background:#1a3a2e;display:flex;flex-direction:column;padding:1.25rem 0;color:#fff;z-index:200;flex-shrink:0}
    .sidebar-logo{display:flex;align-items:center;gap:.75rem;padding:0 1.25rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.1)}
    .logo-icon{width:36px;height:36px;background:#2d9c6f;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem;flex-shrink:0}
    .logo-text{flex:1;min-width:0}
    .logo-title{font-weight:700;font-size:1rem}
    .logo-sub{font-size:.7rem;color:rgba(255,255,255,.5)}
    .sidebar-close{display:none;background:none;border:none;color:rgba(255,255,255,.6);cursor:pointer;font-size:1rem;padding:.3rem;flex-shrink:0}
    .sidebar-nav{flex:1;padding:1rem .75rem;display:flex;flex-direction:column;gap:.15rem;overflow-y:auto}
    .nav-label{font-size:.65rem;color:rgba(255,255,255,.4);letter-spacing:.08em;padding:0 .5rem;margin-bottom:.4rem}
    .nav-label.mt{margin-top:1.25rem}
    .nav-item{display:flex;align-items:center;gap:.75rem;padding:.65rem .75rem;border-radius:8px;color:rgba(255,255,255,.65);text-decoration:none;font-size:.875rem;transition:all .15s}
    .nav-item:hover{background:rgba(255,255,255,.08);color:#fff}
    .nav-item.active{background:#2d9c6f;color:#fff}
    .nav-item i{font-size:.95rem;width:18px;flex-shrink:0}
    .sidebar-user{padding:1rem 1.25rem;border-top:1px solid rgba(255,255,255,.1);display:flex;align-items:center;gap:.75rem;cursor:pointer}
    .user-avatar{width:32px;height:32px;background:#2d9c6f;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;flex-shrink:0}
    .user-name{font-size:.8rem;font-weight:600;color:#fff}
    .user-action{font-size:.7rem;color:rgba(255,255,255,.4)}
    .main-content{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
    .topbar{height:56px;background:#fff;border-bottom:1px solid #e9ecef;display:flex;align-items:center;gap:.75rem;padding:0 1.5rem;flex-shrink:0}
    .menu-btn{display:none;background:none;border:none;cursor:pointer;padding:.4rem;border-radius:8px;color:#374151;font-size:1.1rem;flex-shrink:0}
    .topbar-brand{display:none;align-items:center;gap:.5rem;font-weight:700;color:#1a3a2e;flex-shrink:0}
    .logo-icon-sm{width:26px;height:26px;background:#2d9c6f;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff}
    .search-box{display:flex;align-items:center;gap:.5rem;background:#f1f3f5;border-radius:8px;padding:.4rem .75rem;flex:1;max-width:360px}
    .search-box i{color:#adb5bd;font-size:.85rem;flex-shrink:0}
    .search-box input{border:none;background:transparent;outline:none;font-size:.875rem;color:#495057;width:100%;min-width:0}
    .notif-btn{position:relative;cursor:pointer;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#f1f3f5;margin-left:auto;flex-shrink:0}
    .notif-btn i{font-size:1rem;color:#495057}
    .notif-badge{position:absolute;top:-2px;right:-2px;background:#e53e3e;color:#fff;font-size:.6rem;font-weight:700;border-radius:10px;padding:1px 4px;min-width:16px;text-align:center}
    .page-content{flex:1;overflow-y:auto;padding:1.75rem 2rem}
    .sidebar-overlay{display:none}
    @media(max-width:1024px){
      .sidebar{position:fixed;left:0;top:0;height:100vh;transform:translateX(-100%);box-shadow:4px 0 24px rgba(0,0,0,.18);transition:transform .25s ease}
      .sidebar.open{transform:translateX(0)}
      .sidebar-close{display:flex;align-items:center;justify-content:center}
      .sidebar-overlay{display:block;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:199}
      .menu-btn{display:flex;align-items:center;justify-content:center}
      .topbar-brand{display:flex}
      .topbar{padding:0 1rem}
      .page-content{padding:1.25rem}
    }
    @media(max-width:640px){
      .search-box{display:none}
      .page-content{padding:.875rem}
      .topbar{padding:0 .875rem;gap:.5rem}
    }
  `]
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  notiCount = 0;
  constructor(private auth: AuthService, private familiaService: FamiliaService, private notiService: NotificacionesService) {}
  get userName() { return this.auth.currentUser()?.nombre_completo ?? ''; }
  get userInitial() { return this.userName.charAt(0).toUpperCase(); }
  ngOnInit() { this.familiaService.misFamilias().subscribe(); this.notiService.contarNoLeidas().subscribe((r) => (this.notiCount = r.count)); }
  closeSidebar() { if (window.innerWidth <= 1024) this.sidebarOpen = false; }
  logout() { this.auth.logout(); }
}
