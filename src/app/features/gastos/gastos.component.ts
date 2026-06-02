import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GastosService } from '../../core/services/gastos.service';
import { IngresosService } from '../../core/services/ingresos.service';
import { FamiliaService } from '../../core/services/familia.service';
import { Gasto, Ingreso } from '../../shared/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule,
    DropdownModule, InputNumberModule, InputTextareaModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="page-header">
      <div>
        <h1>Movimientos</h1>
        <p class="subtitle">Registra y administra los ingresos y gastos familiares</p>
      </div>
      <button pButton [label]="tabActivo === 'gastos' ? '+ Nuevo Gasto' : '+ Nuevo Ingreso'"
        class="btn-primary" (click)="abrirModal()"></button>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button class="tab-btn" [class.active]="tabActivo === 'gastos'" (click)="tabActivo = 'gastos'">
        <i class="pi pi-arrow-down-right"></i> Gastos
        <span class="tab-count">{{ gastos.length }}</span>
      </button>
      <button class="tab-btn" [class.active]="tabActivo === 'ingresos'" (click)="tabActivo = 'ingresos'">
        <i class="pi pi-arrow-up-right"></i> Ingresos
        <span class="tab-count">{{ ingresos.length }}</span>
      </button>

      <div class="tab-spacer"></div>

      <!-- Filtro mes -->
      <select class="mes-select" [(ngModel)]="mesSeleccionado" (change)="cargar()">
        <option *ngFor="let m of meses" [value]="m.value">{{ m.label }}</option>
      </select>

      <!-- Totales -->
      <div class="total-badge badge-red" *ngIf="tabActivo === 'gastos'">
        Total gastos: S/ {{ totalGastos | number:'1.0-0' }}
      </div>
      <div class="total-badge badge-green" *ngIf="tabActivo === 'ingresos'">
        Total ingresos: S/ {{ totalIngresos | number:'1.0-0' }}
      </div>
    </div>

    <!-- GASTOS -->
    <div class="movimientos-list" *ngIf="tabActivo === 'gastos'">
      <div class="movimiento-row" *ngFor="let g of gastos">
        <div class="mov-icon" [style.background]="getCatColor(g.categoria_id)">
          <i class="pi pi-shopping-cart"></i>
        </div>
        <div class="mov-info">
          <div class="mov-desc">{{ g.descripcion }}</div>
          <div class="mov-meta">
            <span class="fecha">{{ g.fecha | date:'dd MMM. yyyy' }}</span>
            <span class="tag">{{ getCatNombre(g.categoria_id) }}</span>
            <span class="tag">{{ g.motivo | titlecase }}</span>
            <span class="tag">{{ g.estado_emocional | titlecase }}</span>
          </div>
        </div>
        <div class="mov-right">
          <div class="monto red">-S/ {{ g.monto | number:'1.2-2' }}</div>
          <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm"
            (click)="eliminarGasto(g)"></button>
        </div>
      </div>
      <div class="empty-state" *ngIf="gastos.length === 0">
        <i class="pi pi-wallet"></i>
        <p>No hay gastos registrados este mes</p>
      </div>
    </div>

    <!-- INGRESOS -->
    <div class="movimientos-list" *ngIf="tabActivo === 'ingresos'">
      <div class="movimiento-row" *ngFor="let i of ingresos">
        <div class="mov-icon icon-green">
          <i class="pi pi-arrow-up-right"></i>
        </div>
        <div class="mov-info">
          <div class="mov-desc">{{ i.descripcion || 'Ingreso' }}</div>
          <div class="mov-meta">
            <span class="fecha">{{ i.fecha | date:'dd MMM. yyyy' }}</span>
          </div>
        </div>
        <div class="mov-right">
          <div class="monto green">+S/ {{ i.monto | number:'1.2-2' }}</div>
          <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm"
            (click)="eliminarIngreso(i)"></button>
        </div>
      </div>
      <div class="empty-state" *ngIf="ingresos.length === 0">
        <i class="pi pi-arrow-up-right"></i>
        <p>No hay ingresos registrados este mes</p>
      </div>
    </div>

    <!-- Modal Nuevo Gasto -->
    <p-dialog header="Registrar Gasto" [(visible)]="modalGasto"
      [modal]="true" [style]="{width: '460px'}">
      <div class="form-group">
        <label>Monto (S/)</label>
        <p-inputNumber [(ngModel)]="formGasto.monto" mode="decimal"
          [minFractionDigits]="2" placeholder="0.00" styleClass="w-full" />
      </div>
      <div class="form-group">
        <label>Categoría</label>
        <p-dropdown [options]="categorias" [(ngModel)]="formGasto.categoria_id"
          optionLabel="nombre" optionValue="id" placeholder="Seleccionar" styleClass="w-full" />
      </div>
      <div class="form-group">
        <label>Descripción</label>
        <input pInputText [(ngModel)]="formGasto.descripcion"
          placeholder="¿En qué gastaste?" class="w-full" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Motivo del gasto</label>
          <p-dropdown [options]="motivos" [(ngModel)]="formGasto.motivo"
            placeholder="Seleccionar" styleClass="w-full" />
        </div>
        <div class="form-group">
          <label>Estado emocional</label>
          <p-dropdown [options]="estadosEmocionales" [(ngModel)]="formGasto.estado_emocional"
            placeholder="Seleccionar" styleClass="w-full" />
        </div>
      </div>
      <div class="form-group">
        <label>Notas (opcional)</label>
        <textarea pInputTextarea [(ngModel)]="formGasto.notas"
          placeholder="Observaciones adicionales..." rows="2" class="w-full"></textarea>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalGasto = false"></button>
        <button pButton label="Guardar Gasto" class="btn-primary" [loading]="saving" (click)="guardarGasto()"></button>
      </ng-template>
    </p-dialog>

    <!-- Modal Nuevo Ingreso -->
    <p-dialog header="Registrar Ingreso" [(visible)]="modalIngreso"
      [modal]="true" [style]="{width: '400px'}">
      <div class="form-group">
        <label>Monto (S/)</label>
        <p-inputNumber [(ngModel)]="formIngreso.monto" mode="decimal"
          [minFractionDigits]="2" placeholder="0.00" styleClass="w-full" />
      </div>
      <div class="form-group">
        <label>Descripción (opcional)</label>
        <input pInputText [(ngModel)]="formIngreso.descripcion"
          placeholder="Ej: Sueldo, freelance, bono..." class="w-full" />
      </div>
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" [(ngModel)]="formIngreso.fecha" class="date-input w-full" />
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalIngreso = false"></button>
        <button pButton label="Guardar Ingreso" class="btn-primary" [loading]="saving" (click)="guardarIngreso()"></button>
      </ng-template>
    </p-dialog>

    <p-toast />
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a3a2e; margin: 0; }
    .subtitle { color: #6c757d; font-size: 0.875rem; margin-top: 0.25rem; }
    .btn-primary { background: #2d9c6f !important; border-color: #2d9c6f !important; border-radius: 8px !important; }

    .tabs-bar {
      display: flex; align-items: center; gap: 0.5rem;
      background: #fff; border-radius: 12px; padding: 0.5rem 1rem;
      border: 1px solid #e9ecef; margin-bottom: 1rem;
    }
    .tab-btn {
      display: flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 1rem; border: none; border-radius: 8px;
      font-size: 0.875rem; font-weight: 600; cursor: pointer;
      color: #6c757d; background: transparent; transition: all 0.15s;
    }
    .tab-btn.active { background: #f0fdf4; color: #1a3a2e; }
    .tab-btn i { font-size: 0.8rem; }
    .tab-count { background: #e9ecef; border-radius: 10px; padding: 1px 7px; font-size: 0.7rem; }
    .tab-btn.active .tab-count { background: #bbf7d0; color: #166534; }
    .tab-spacer { flex: 1; }
    .mes-select { padding: 0.4rem 0.75rem; border: 1px solid #e9ecef; border-radius: 8px; font-size: 0.825rem; outline: none; }
    .total-badge { padding: 0.35rem 0.9rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-green { background: #dcfce7; color: #166534; }

    .movimientos-list { background: #fff; border-radius: 12px; border: 1px solid #e9ecef; overflow: hidden; }
    .movimiento-row { display: flex; align-items: center; gap: 1rem; padding: 0.9rem 1.25rem; border-bottom: 1px solid #f3f4f6; }
    .movimiento-row:last-child { border-bottom: none; }
    .mov-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .mov-icon i { color: #fff; font-size: 0.9rem; }
    .icon-green { background: #2d9c6f; }
    .mov-info { flex: 1; }
    .mov-desc { font-weight: 600; font-size: 0.9rem; color: #1a3a2e; margin-bottom: 0.25rem; }
    .mov-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }
    .fecha { font-size: 0.75rem; color: #6c757d; }
    .tag { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: #f3f4f6; color: #6b7280; }
    .mov-right { display: flex; align-items: center; gap: 0.5rem; }
    .monto { font-weight: 700; font-size: 0.95rem; }
    .monto.red { color: #dc2626; }
    .monto.green { color: #16a34a; }
    .empty-state { padding: 3rem; text-align: center; color: #adb5bd; }
    .empty-state i { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }

    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .date-input { padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.875rem; width: 100%; outline: none; }
    .date-input:focus { border-color: #2d9c6f; box-shadow: 0 0 0 2px rgba(45,156,111,0.15); }
  `],
})
export class GastosComponent implements OnInit {
  tabActivo: 'gastos' | 'ingresos' = 'gastos';
  gastos: Gasto[] = [];
  ingresos: Ingreso[] = [];
  totalGastos = 0;
  totalIngresos = 0;
  saving = false;
  modalGasto = false;
  modalIngreso = false;
  mesSeleccionado = '';
  meses: { label: string; value: string }[] = [];

  formGasto = { monto: 0, categoria_id: null as any, descripcion: '', motivo: '', estado_emocional: '', notas: '' };
  formIngreso = { monto: 0, descripcion: '', fecha: new Date().toISOString().split('T')[0] };

  categorias = [
    { id: 1, nombre: 'Alimentación' }, { id: 2, nombre: 'Transporte' },
    { id: 3, nombre: 'Vivienda' }, { id: 4, nombre: 'Servicios' },
    { id: 5, nombre: 'Salud' }, { id: 6, nombre: 'Educación' },
    { id: 7, nombre: 'Entretenimiento' }, { id: 8, nombre: 'Ropa' }, { id: 9, nombre: 'Otros' },
  ];
  motivos = ['necesidad', 'impulso', 'emergencia'];
  estadosEmocionales = ['neutral', 'estres', 'celebracion'];

  private catColores: Record<number, string> = {
    1: '#4CAF50', 2: '#2196F3', 3: '#9C27B0', 4: '#FF9800',
    5: '#F44336', 6: '#00BCD4', 7: '#E91E63', 8: '#795548', 9: '#607D8B',
  };

  constructor(
    private gastosService: GastosService,
    private ingresosService: IngresosService,
    private familiaService: FamiliaService,
    private msg: MessageService,
  ) {}

  ngOnInit() {
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
      this.meses.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value: val });
    }
    this.mesSeleccionado = this.meses[0].value;
    this.cargar();
  }

  cargar() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.gastosService.listar(f.id, this.mesSeleccionado).subscribe((gs) => {
      this.gastos = gs;
      this.totalGastos = gs.reduce((s, g) => s + +g.monto, 0);
    });
    this.ingresosService.listar(f.id, this.mesSeleccionado).subscribe((is) => {
      this.ingresos = is;
      this.totalIngresos = is.reduce((s, i) => s + +i.monto, 0);
    });
  }

  abrirModal() {
    if (this.tabActivo === 'gastos') {
      this.formGasto = { monto: 0, categoria_id: null, descripcion: '', motivo: '', estado_emocional: '', notas: '' };
      this.modalGasto = true;
    } else {
      this.formIngreso = { monto: 0, descripcion: '', fecha: new Date().toISOString().split('T')[0] };
      this.modalIngreso = true;
    }
  }

  guardarGasto() {
    if (!this.formGasto.monto || !this.formGasto.categoria_id || !this.formGasto.descripcion || !this.formGasto.motivo || !this.formGasto.estado_emocional) {
      this.msg.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa todos los campos obligatorios' });
      return;
    }
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.saving = true;
    this.gastosService.crear({ ...this.formGasto, familia_id: f.id }).subscribe({
      next: () => { this.modalGasto = false; this.saving = false; this.cargar(); this.msg.add({ severity: 'success', summary: 'Guardado', detail: 'Gasto registrado' }); },
      error: () => { this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' }); this.saving = false; },
    });
  }

  guardarIngreso() {
    if (!this.formIngreso.monto) {
      this.msg.add({ severity: 'warn', summary: 'Campo requerido', detail: 'Ingresa el monto' });
      return;
    }
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.saving = true;
    this.ingresosService.crear({ ...this.formIngreso, familia_id: f.id }).subscribe({
      next: () => { this.modalIngreso = false; this.saving = false; this.cargar(); this.msg.add({ severity: 'success', summary: 'Guardado', detail: 'Ingreso registrado' }); },
      error: () => { this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' }); this.saving = false; },
    });
  }

  eliminarGasto(g: Gasto) {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.gastosService.eliminar(f.id, g.id).subscribe(() => this.cargar());
  }

  eliminarIngreso(i: Ingreso) {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    this.ingresosService.eliminar(f.id, i.id).subscribe(() => this.cargar());
  }

  getCatColor(id: number) { return this.catColores[id] ?? '#e9ecef'; }
  getCatNombre(id: number) { return this.categorias.find((c) => c.id === id)?.nombre ?? ''; }
}
