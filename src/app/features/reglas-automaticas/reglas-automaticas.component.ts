import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReglasService } from '../../core/services/reglas.service';
import { FamiliaService } from '../../core/services/familia.service';
import { ReglaAutomatica } from '../../shared/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reglas-automaticas',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule,
    DropdownModule, InputNumberModule, InputSwitchModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="page-header">
      <div>
        <h1>Reglas Automáticas</h1>
        <p class="subtitle">Configura acciones automáticas para optimizar tu presupuesto</p>
      </div>
      <button pButton label="+ Nueva Regla" class="btn-primary" (click)="abrirModal()"></button>
    </div>

    <!-- Explicación -->
    <div class="info-card">
      <div class="info-icon"><i class="pi pi-bolt"></i></div>
      <div>
        <div class="info-title">Automatiza tu presupuesto</div>
        <div class="info-desc">Las reglas te ayudan a mantener el control sin intervención manual. Se ejecutan automáticamente cuando se cumplen las condiciones definidas.</div>
      </div>
    </div>

    <!-- Lista de reglas -->
    <div class="reglas-list">
      <div class="regla-item" *ngFor="let r of reglas">
        <div class="regla-icon" [class]="'regla-icon-' + getTipoColor(r.tipo_regla)">
          <i [class]="getTipoIcono(r.tipo_regla)"></i>
        </div>
        <div class="regla-info">
          <div class="regla-nombre">
            {{ r.nombre }}
            <span class="estado-badge" [class]="r.esta_activo ? 'activo' : 'inactivo'">
              {{ r.esta_activo ? 'Activa' : 'Inactiva' }}
            </span>
          </div>
          <div class="regla-condicion">
            <span class="label-si">Si:</span> {{ describir(r) }}
          </div>
          <div class="regla-accion">
            <span class="label-entonces">Entonces:</span>
            <span class="accion-text">{{ describirAccion(r.accion) }}</span>
          </div>
        </div>
        <div class="regla-toggle">
          <p-inputSwitch [(ngModel)]="r.esta_activo" (onChange)="toggleRegla(r)" />
        </div>
        <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm"
          (click)="eliminar(r)"></button>
      </div>

      <div class="empty-state" *ngIf="reglas.length === 0">
        <i class="pi pi-bolt"></i>
        <p>No tienes reglas configuradas. ¡Crea tu primera regla automática!</p>
      </div>
    </div>

    <!-- Modal -->
    <p-dialog header="Crear Regla Automática" [(visible)]="modalVisible"
      [modal]="true" [style]="{width: '460px'}">
      <div class="form-group">
        <label>Tipo de regla</label>
        <p-dropdown [options]="tiposRegla" [(ngModel)]="form.tipo_regla"
          optionLabel="label" optionValue="value"
          placeholder="Seleccionar tipo" styleClass="w-full" />
      </div>
      <div class="form-group">
        <label>Nombre de la regla</label>
        <input pInputText [(ngModel)]="form.nombre" placeholder="Ej: Alerta gastos entretenimiento" class="w-full" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Condición — Categoría</label>
          <p-dropdown [options]="categorias" [(ngModel)]="form.condicion_categoria_id"
            optionLabel="nombre" optionValue="id" placeholder="Categoría" styleClass="w-full" />
        </div>
        <div class="form-group">
          <label>Monto límite (S/)</label>
          <p-inputNumber [(ngModel)]="form.condicion_monto" mode="decimal"
            placeholder="S/" styleClass="w-full" />
        </div>
      </div>
      <div class="form-group">
        <label>Acción a ejecutar</label>
        <p-dropdown [options]="acciones" [(ngModel)]="form.accion"
          optionLabel="label" optionValue="value"
          placeholder="Seleccionar acción" styleClass="w-full" />
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalVisible = false"></button>
        <button pButton label="Crear Regla" class="btn-primary" [loading]="saving" (click)="guardar()"></button>
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a3a2e; margin: 0; }
    .subtitle { color: #6c757d; font-size: 0.875rem; margin-top: 0.25rem; }
    .btn-primary { background: #2d9c6f !important; border-color: #2d9c6f !important; border-radius: 8px !important; }

    .info-card { display: flex; gap: 1rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.1rem 1.25rem; margin-bottom: 1.25rem; align-items: flex-start; }
    .info-icon { width: 36px; height: 36px; background: #2d9c6f; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .info-icon i { color: #fff; }
    .info-title { font-weight: 700; font-size: 0.9rem; color: #1a3a2e; }
    .info-desc { font-size: 0.8rem; color: #6c757d; margin-top: 0.2rem; line-height: 1.5; }

    .reglas-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .regla-item { display: flex; align-items: center; gap: 1rem; background: #fff; border-radius: 12px; padding: 1.1rem 1.25rem; border: 1px solid #e9ecef; }
    .regla-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .regla-icon-warn { background: #fef9c3; color: #854d0e; }
    .regla-icon-info { background: #dbeafe; color: #1e40af; }
    .regla-icon-danger { background: #fee2e2; color: #991b1b; }
    .regla-info { flex: 1; }
    .regla-nombre { font-weight: 700; font-size: 0.9rem; color: #1a3a2e; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
    .estado-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .estado-badge.activo { background: #dcfce7; color: #166534; }
    .estado-badge.inactivo { background: #f3f4f6; color: #6b7280; }
    .regla-condicion, .regla-accion { font-size: 0.8rem; color: #6c757d; }
    .label-si, .label-entonces { font-weight: 600; color: #374151; margin-right: 0.3rem; }
    .accion-text { color: #2d9c6f; font-weight: 500; }
    .regla-toggle { flex-shrink: 0; }
    .empty-state { padding: 3rem; text-align: center; color: #adb5bd; background: #fff; border-radius: 12px; }
    .empty-state i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  `],
})
export class ReglasAutomaticasComponent implements OnInit {
  reglas: ReglaAutomatica[] = [];
  modalVisible = false; saving = false;
  form = { tipo_regla: '', nombre: '', condicion_categoria_id: null as any, condicion_monto: null as any, accion: '' };

  tiposRegla = [
    { label: 'Límite de gastos superado', value: 'limite_gastos_superado' },
    { label: 'Ingreso extra detectado', value: 'ingreso_extra_detectado' },
    { label: 'Meta de ahorro no cumplida', value: 'meta_no_cumplida' },
  ];
  acciones = [
    { label: 'Enviar notificación', value: 'enviar_notificacion' },
    { label: 'Reducir límite de gastos', value: 'reducir_limite_gastos' },
    { label: 'Transferir a ahorros', value: 'transferir_a_ahorros' },
    { label: 'Bloquear categoría', value: 'bloquear_categoria' },
  ];
  categorias = [
    { id: 1, nombre: 'Alimentación' }, { id: 2, nombre: 'Transporte' }, { id: 3, nombre: 'Vivienda' },
    { id: 4, nombre: 'Servicios' }, { id: 5, nombre: 'Salud' }, { id: 6, nombre: 'Educación' },
    { id: 7, nombre: 'Entretenimiento' }, { id: 8, nombre: 'Ropa' }, { id: 9, nombre: 'Otros' },
  ];

  constructor(private reglasService: ReglasService, private familiaService: FamiliaService, private msg: MessageService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.reglasService.listar(f.id).subscribe((rs) => (this.reglas = rs));
  }

  abrirModal() { this.form = { tipo_regla: '', nombre: '', condicion_categoria_id: null, condicion_monto: null, accion: '' }; this.modalVisible = true; }

  guardar() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.saving = true;
    this.reglasService.crear({ ...this.form, familia_id: f.id }).subscribe({
      next: () => { this.modalVisible = false; this.saving = false; this.cargar(); },
      error: () => { this.saving = false; },
    });
  }

  toggleRegla(r: ReglaAutomatica) { this.reglasService.toggle(r.id).subscribe(); }
  eliminar(r: ReglaAutomatica) { this.reglasService.eliminar(r.id).subscribe(() => this.cargar()); }

  getTipoIcono(tipo: string) {
    const m: Record<string, string> = { limite_gastos_superado: 'pi pi-exclamation-triangle', ingreso_extra_detectado: 'pi pi-arrow-up-right', meta_no_cumplida: 'pi pi-times-circle' };
    return m[tipo] ?? 'pi pi-bolt';
  }
  getTipoColor(tipo: string) {
    const m: Record<string, string> = { limite_gastos_superado: 'warn', ingreso_extra_detectado: 'info', meta_no_cumplida: 'danger' };
    return m[tipo] ?? 'info';
  }
  describir(r: ReglaAutomatica) {
    const cat = this.categorias.find((c) => c.id === r.condicion_categoria_id)?.nombre ?? '';
    const monto = r.condicion_monto ? `S/ ${r.condicion_monto}` : '';
    return [cat, monto].filter(Boolean).join(' supera ') || r.tipo_regla;
  }
  describirAccion(accion: string) { return this.acciones.find((a) => a.value === accion)?.label ?? accion; }
}
