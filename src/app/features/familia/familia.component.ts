import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FamiliaService } from '../../core/services/familia.service';
import { MiembroFamilia } from '../../shared/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
//import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-familia',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, InputNumberModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="page-header">
      <div>
        <h1>Grupo Familiar</h1>
        <p class="subtitle">Administra los miembros y sus permisos financieros</p>
      </div>
      <!-- <button pButton label="+ Añadir Miembro" icon="pi pi-user-plus"
        class="btn-primary" (click)="abrirModal()"></button> -->
    </div>

    <!-- Resumen + Código de invitación -->
    <div class="top-row">
      <div class="resumen-card">
        <div>
          <div class="resumen-titulo">Resumen del Grupo</div>
          <div class="resumen-sub">{{ miembros.length }} miembros activos</div>
        </div>
        <div class="gasto-total">
          <div class="gasto-total-label">Gasto total del grupo</div>
          <div class="gasto-total-val">S/ {{ totalGastoGrupo | number:'1.0-0' }}</div>
        </div>
      </div>

      <!-- Código de invitación -->
      <div class="codigo-card">
        <div class="codigo-header">
          <div>
            <div class="codigo-titulo"><i class="pi pi-key"></i> Código de Invitación</div>
            <div class="codigo-sub">Comparte este código con los nuevos miembros</div>
          </div>
          <button pButton icon="pi pi-refresh" class="p-button-text p-button-sm"
            pTooltip="Regenerar código" (click)="regenerarCodigo()" [loading]="regenerando"></button>
        </div>
        <div class="codigo-display" *ngIf="codigo">
          <span class="codigo-text">{{ codigo }}</span>
          <button pButton icon="pi pi-copy" class="p-button-text p-button-sm"
            (click)="copiarCodigo()" [label]="copiado ? 'Copiado' : 'Copiar'"></button>
        </div>
        <div class="codigo-loading" *ngIf="!codigo">
          <i class="pi pi-spin pi-spinner"></i> Cargando código...
        </div>
        <div class="codigo-expira" *ngIf="expiraEn">Expira: {{ expiraEn | date:'dd/MM/yyyy HH:mm' }}</div>
      </div>
    </div>

    <!-- Grid de miembros -->
    <div class="miembros-grid">
      <div class="miembro-card" *ngFor="let m of miembros">
        <div class="miembro-header">
          <div class="avatar" [style.background]="getAvatarColor(m.nombre_completo || m.usuario?.nombre_completo || '')">
            {{ getInitials(m.nombre_completo || m.usuario?.nombre_completo || '') }}
          </div>
          <div class="miembro-info">
            <div class="miembro-nombre">
              {{ m.nombre_completo || m.usuario?.nombre_completo }}
              <span class="rol-badge" [class]="'rol-' + m.rol">{{ m.rol }}</span>
            </div>
            <div class="miembro-correo">{{ m.correo_invitado || m.usuario?.correo }}</div>
            <div class="miembro-desc">{{ getRolDesc(m.rol) }}</div>
          </div>
        </div>

        <ng-container *ngIf="m.limite_gasto_mensual > 0">
          <div class="limite-label">
            <span>Límite de gasto</span>
            <span>S/ {{ m.gasto_actual_mes | number:'1.0-0' }} / S/ {{ m.limite_gasto_mensual | number:'1.0-0' }}</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill"
              [style.width.%]="getPorcentaje(m)"
              [class.danger]="getPorcentaje(m) >= 80"></div>
          </div>
        </ng-container>
        <div class="sin-limite" *ngIf="m.limite_gasto_mensual === 0">Sin límite de gasto asignado</div>

        <div class="miembro-estado" *ngIf="m.estado === 'invitado'">
          <i class="pi pi-clock"></i> Pendiente de registro
        </div>

        <div class="miembro-actions">
          <button pButton icon="pi pi-pencil" label="Editar"
            class="p-button-text p-button-sm" (click)="abrirEditar(m)"></button>
          <button pButton icon="pi pi-trash"
            class="p-button-text p-button-danger p-button-sm" (click)="eliminar(m)"></button>
        </div>
      </div>
    </div>

    <!-- Descripción de roles -->
    <div class="roles-card">
      <div class="roles-titulo">Descripción de Roles</div>
      <div class="roles-grid">
        <div class="rol-item">
          <div class="rol-icon"><i class="pi pi-shield"></i></div>
          <div><div class="rol-nombre">Administrador</div><div class="rol-desc">Acceso completo al sistema</div></div>
        </div>
        <div class="rol-item">
          <div class="rol-icon edit"><i class="pi pi-pencil"></i></div>
          <div><div class="rol-nombre">Colaborador</div><div class="rol-desc">Puede registrar gastos e ingresos</div></div>
        </div>
        <div class="rol-item">
          <div class="rol-icon view"><i class="pi pi-eye"></i></div>
          <div><div class="rol-nombre">Observador</div><div class="rol-desc">Solo visualización</div></div>
        </div>
      </div>
    </div>

    <!-- Modal añadir/editar -->
    <p-dialog [header]="editando ? 'Editar Miembro' : 'Añadir Miembro Familiar'"
      [(visible)]="modalVisible" [modal]="true" [style]="{width: '440px'}">
      <div class="form-group">
        <label>Nombre completo</label>
        <input pInputText [(ngModel)]="form.nombre_completo" placeholder="Nombre del miembro" class="w-full" />
      </div>
      <div class="form-group">
        <label>Correo electrónico</label>
        <input pInputText [(ngModel)]="form.correo" type="email" placeholder="correo@ejemplo.com" class="w-full" />
      </div>
      <div class="form-group">
        <label>Rol</label>
        <p-dropdown [options]="roles" [(ngModel)]="form.rol"
          optionLabel="label" optionValue="value"
          placeholder="Seleccionar rol" styleClass="w-full" />
      </div>
      <div class="form-group">
        <label>Límite de gasto mensual (S/) — Opcional</label>
        <p-inputNumber [(ngModel)]="form.limite_gasto_mensual" mode="decimal"
          [min]="0" placeholder="0 = sin límite" styleClass="w-full" />
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalVisible = false"></button>
        <button pButton [label]="editando ? 'Guardar cambios' : 'Añadir Miembro'"
          class="btn-primary" [loading]="saving" (click)="guardar()"></button>
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a3a2e; margin: 0; }
    .subtitle { color: #6c757d; font-size: 0.875rem; margin-top: 0.25rem; }
    .btn-primary { background: #2d9c6f !important; border-color: #2d9c6f !important; border-radius: 8px !important; }

    .top-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }

    .resumen-card { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.1rem 1.5rem; }
    .resumen-titulo { font-weight: 700; font-size: 0.95rem; color: #1a3a2e; }
    .resumen-sub { font-size: 0.8rem; color: #6c757d; }
    .gasto-total { text-align: right; }
    .gasto-total-label { font-size: 0.75rem; color: #6c757d; }
    .gasto-total-val { font-size: 1.3rem; font-weight: 700; color: #1a3a2e; }

    .codigo-card { background: #fff; border: 1px solid #e9ecef; border-radius: 12px; padding: 1.1rem 1.25rem; }
    .codigo-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .codigo-titulo { font-weight: 700; font-size: 0.9rem; color: #1a3a2e; display: flex; align-items: center; gap: 0.4rem; }
    .codigo-sub { font-size: 0.75rem; color: #6c757d; margin-top: 0.2rem; }
    .codigo-display { display: flex; align-items: center; gap: 0.75rem; background: #f3f4f6; border-radius: 8px; padding: 0.6rem 1rem; }
    .codigo-text { font-family: monospace; font-size: 1.2rem; font-weight: 700; letter-spacing: 0.15em; color: #1a3a2e; flex: 1; }
    .codigo-loading { color: #9ca3af; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; }
    .codigo-expira { font-size: 0.72rem; color: #9ca3af; margin-top: 0.5rem; }

    .miembros-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
    .miembro-card { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e9ecef; }
    .miembro-header { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    .avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; color: #fff; flex-shrink: 0; }
    .miembro-nombre { font-weight: 700; font-size: 0.9rem; color: #1a3a2e; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
    .miembro-correo { font-size: 0.78rem; color: #6c757d; margin-top: 0.2rem; }
    .miembro-desc { font-size: 0.75rem; color: #9ca3af; margin-top: 0.15rem; }
    .rol-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .rol-administrador { background: #dbeafe; color: #1e40af; }
    .rol-colaborador { background: #fef9c3; color: #854d0e; }
    .rol-observador { background: #f3f4f6; color: #6b7280; }
    .limite-label { display: flex; justify-content: space-between; font-size: 0.78rem; color: #6c757d; margin-bottom: 0.3rem; }
    .progress-bar-wrap { height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: #2d9c6f; border-radius: 3px; }
    .progress-bar-fill.danger { background: #dc2626; }
    .sin-limite { font-size: 0.78rem; color: #9ca3af; }
    .miembro-estado { font-size: 0.75rem; color: #d97706; background: #fef9c3; border-radius: 6px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.4rem; }
    .miembro-actions { display: flex; justify-content: flex-end; margin-top: 0.75rem; gap: 0.25rem; }

    .roles-card { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e9ecef; }
    .roles-titulo { font-weight: 700; font-size: 0.95rem; color: #1a3a2e; margin-bottom: 1rem; }
    .roles-grid { display: flex; gap: 2rem; }
    .rol-item { display: flex; align-items: center; gap: 0.75rem; }
    .rol-icon { width: 32px; height: 32px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .rol-icon.edit { background: #fef9c3; }
    .rol-icon.view { background: #dbeafe; }
    .rol-nombre { font-weight: 600; font-size: 0.825rem; }
    .rol-desc { font-size: 0.75rem; color: #6c757d; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
  `],
})
export class FamiliaComponent implements OnInit {
  miembros: MiembroFamilia[] = [];
  modalVisible = false; saving = false; editando = false;
  miembroEditando: MiembroFamilia | null = null;
  form = { nombre_completo: '', correo: '', rol: '', limite_gasto_mensual: 0 };
  totalGastoGrupo = 0;
  codigo = '';
  expiraEn: string | null = null;
  regenerando = false;
  copiado = false;

  roles = [
    { label: 'Administrador', value: 'administrador' },
    { label: 'Colaborador', value: 'colaborador' },
    { label: 'Observador', value: 'observador' },
  ];

  private avatarColors = ['#2d9c6f', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

  constructor(private familiaService: FamiliaService, private msg: MessageService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.familiaService.obtenerMiembros(f.id).subscribe((ms) => {
      this.miembros = ms;
      this.totalGastoGrupo = ms.reduce((s, m) => s + +m.gasto_actual_mes, 0);
    });
    this.familiaService.obtenerCodigo(f.id).subscribe((res) => {
      this.codigo = res.codigo;
      this.expiraEn = res.expira_en;
    });
  }

  regenerarCodigo() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.regenerando = true;
    this.familiaService.regenerarCodigo(f.id).subscribe({
      next: (res) => { this.codigo = res.codigo; this.expiraEn = res.expira_en; this.regenerando = false; this.msg.add({ severity: 'success', summary: 'Listo', detail: 'Código regenerado' }); },
      error: () => { this.regenerando = false; },
    });
  }

  copiarCodigo() {
    navigator.clipboard.writeText(this.codigo);
    this.copiado = true;
    setTimeout(() => (this.copiado = false), 2000);
    this.msg.add({ severity: 'success', summary: 'Copiado', detail: 'Código copiado al portapapeles' });
  }

  abrirModal() { this.editando = false; this.miembroEditando = null; this.form = { nombre_completo: '', correo: '', rol: '', limite_gasto_mensual: 0 }; this.modalVisible = true; }

  abrirEditar(m: MiembroFamilia) {
    this.editando = true; this.miembroEditando = m;
    this.form = { nombre_completo: m.nombre_completo ?? '', correo: m.correo_invitado ?? '', rol: m.rol, limite_gasto_mensual: m.limite_gasto_mensual };
    this.modalVisible = true;
  }

  guardar() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.saving = true;
    const obs = this.editando && this.miembroEditando
      ? this.familiaService.actualizarMiembro(f.id, this.miembroEditando.id, this.form)
      : this.familiaService.agregarMiembro(f.id, this.form);
    obs.subscribe({
      next: () => { this.modalVisible = false; this.saving = false; this.cargar(); },
      error: () => { this.saving = false; },
    });
  }

  eliminar(m: MiembroFamilia) {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.familiaService.eliminarMiembro(f.id, m.id).subscribe(() => this.cargar());
  }

  getInitials(nombre: string) { return nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase(); }
  getAvatarColor(nombre: string) { const i = nombre.charCodeAt(0) % this.avatarColors.length; return this.avatarColors[i]; }
  getPorcentaje(m: MiembroFamilia) { return m.limite_gasto_mensual > 0 ? Math.min(100, (m.gasto_actual_mes / m.limite_gasto_mensual) * 100) : 0; }
  getRolDesc(rol: string) { const d: Record<string, string> = { administrador: 'Acceso completo al sistema', colaborador: 'Puede registrar gastos e ingresos', observador: 'Solo visualización' }; return d[rol] ?? ''; }
}
