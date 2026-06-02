import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { FamiliaService } from '../../core/services/familia.service';
import { GastosService } from '../../core/services/gastos.service';
import { IngresosService } from '../../core/services/ingresos.service';
import { MetasAhorroService } from '../../core/services/metas-ahorro.service';
import { Gasto, MetaAhorro } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartModule, ProgressBarModule, TagModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Dashboard Financiero</h1>
        <p class="subtitle">Resumen del estado financiero de tu familia • {{ mesActual }}</p>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-green">
        <div class="kpi-label">Ingresos del Mes</div>
        <div class="kpi-value">S/ {{ totalIngresos | number:'1.0-0' }}</div>
        <div class="kpi-icon"><i class="pi pi-arrow-up-right"></i></div>
      </div>
      <div class="kpi-card kpi-red">
        <div class="kpi-label">Gastos del Mes</div>
        <div class="kpi-value">S/ {{ totalGastos | number:'1.0-0' }}</div>
        <div class="kpi-icon"><i class="pi pi-arrow-down-right"></i></div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-label">Capacidad de Ahorro</div>
        <div class="kpi-value">S/ {{ capacidadAhorro | number:'1.0-0' }}</div>
        <div class="kpi-sub">Disponible para ahorrar</div>
      </div>
      <div class="kpi-card kpi-gray">
        <div class="kpi-label">Tasa de Ahorro</div>
        <div class="kpi-value">{{ tasaAhorro | number:'1.1-1' }}%</div>
        <div class="kpi-sub">Del ingreso total</div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <!-- Distribución por categoría -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Distribución de Gastos</div>
          <div class="card-sub">Este mes por categoría</div>
        </div>
        <p-chart type="doughnut" [data]="donutData" [options]="donutOptions" height="200px" *ngIf="donutData" />
        <div class="no-data" *ngIf="!donutData">Sin gastos este mes</div>
      </div>

      <!-- Alertas -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Alertas</div>
          <div class="card-sub">Notificaciones importantes</div>
        </div>
        <div class="alert-item alert-warn" *ngIf="tasaAhorro < 20">
          <i class="pi pi-exclamation-triangle"></i>
          <div>
            <div class="alert-title">Tasa de ahorro baja</div>
            <div class="alert-msg">Tu tasa de ahorro está por debajo del 20% recomendado</div>
          </div>
        </div>
        <div class="alert-item alert-success" *ngFor="let meta of metasDestacadas">
          <i class="pi pi-check-circle"></i>
          <div>
            <div class="alert-title">Meta: {{ meta.nombre }}</div>
            <div class="alert-msg">Fondo al {{ meta.porcentaje }}% — ¡Vas muy bien!</div>
          </div>
        </div>
        <div class="no-data" *ngIf="tasaAhorro >= 20 && metasDestacadas.length === 0">Sin alertas</div>
      </div>

      <!-- Últimos gastos -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Últimos Gastos</div>
          <div class="card-sub">Registro reciente</div>
        </div>
        <div class="gasto-item" *ngFor="let g of ultimosGastos">
          <div class="gasto-icon" [style.background]="getCategoriaColor(g.categoria_id)">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <div class="gasto-info">
            <div class="gasto-desc">{{ g.descripcion }}</div>
            <div class="gasto-tags">
              <span class="tag-motivo">{{ g.motivo | titlecase }}</span>
              <span class="tag-emocional">{{ g.estado_emocional | titlecase }}</span>
            </div>
          </div>
          <div class="gasto-monto">-S/ {{ g.monto | number:'1.0-0' }}</div>
        </div>
        <a routerLink="/gastos" class="ver-todos">Ver todos los gastos →</a>
      </div>
    </div>

    <!-- Metas de ahorro -->
    <div class="section-header">
      <div>
        <div class="section-title">Metas de Ahorro</div>
        <div class="section-sub">Progreso hacia tus objetivos familiares</div>
      </div>
      <a routerLink="/metas-ahorro" class="ver-todos">Ver todas →</a>
    </div>
    <div class="metas-grid">
      <div class="meta-card" *ngFor="let m of metas.slice(0, 4)">
        <div class="meta-header">
          <div class="meta-icon"><i class="pi pi-bullseye"></i></div>
          <div class="meta-info">
            <div class="meta-nombre">{{ m.nombre }}</div>
            <div class="meta-cat">{{ getCatMetaNombre(m.categoria_id) }}</div>
          </div>
          <span class="prioridad-badge" [class]="'prioridad-' + m.prioridad">{{ m.prioridad }}</span>
        </div>
        <div class="meta-progress-label">
          <span>Progreso</span><span>{{ m.porcentaje ?? 0 }}%</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" [style.width.%]="m.porcentaje ?? 0"></div>
        </div>
        <div class="meta-footer">
          <span>S/ {{ m.monto_ahorrado | number:'1.0-0' }}</span>
          <span class="meta-mensual">S/ {{ calcMensual(m) | number:'1.0-0' }}/mes</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a3a2e; margin: 0; }
    .subtitle { color: #6c757d; font-size: 0.875rem; margin-top: 0.25rem; }

    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }

    .kpi-card {
      background: #fff; border-radius: 12px; padding: 1.25rem;
      position: relative; overflow: hidden; border: 1px solid #e9ecef;
    }
    .kpi-label { font-size: 0.8rem; color: #6c757d; margin-bottom: 0.4rem; }
    .kpi-value { font-size: 1.6rem; font-weight: 700; }
    .kpi-sub { font-size: 0.75rem; color: #6c757d; margin-top: 0.25rem; }
    .kpi-icon { position: absolute; top: 1rem; right: 1rem; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .kpi-green .kpi-value { color: #166534; }
    .kpi-green .kpi-icon { background: #dcfce7; color: #166534; }
    .kpi-red .kpi-value { color: #991b1b; }
    .kpi-red .kpi-icon { background: #fee2e2; color: #991b1b; }
    .kpi-teal .kpi-value { color: #0f766e; }
    .kpi-teal .kpi-icon { background: #ccfbf1; color: #0f766e; }
    .kpi-gray .kpi-value { color: #374151; }
    .kpi-gray .kpi-icon { background: #f3f4f6; color: #374151; }

    .charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }

    .card { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e9ecef; }
    .card-header { margin-bottom: 1rem; }
    .card-title { font-weight: 600; font-size: 0.95rem; color: #1a3a2e; }
    .card-sub { font-size: 0.75rem; color: #6c757d; }

    .alert-item {
      display: flex; gap: 0.75rem; padding: 0.75rem;
      border-radius: 8px; margin-bottom: 0.75rem; align-items: flex-start;
    }
    .alert-warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .alert-title { font-weight: 600; font-size: 0.8rem; }
    .alert-msg { font-size: 0.75rem; margin-top: 0.2rem; }

    .gasto-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; }
    .gasto-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #e9ecef; flex-shrink: 0; }
    .gasto-icon i { font-size: 0.8rem; color: #fff; }
    .gasto-info { flex: 1; }
    .gasto-desc { font-size: 0.825rem; font-weight: 500; color: #374151; }
    .gasto-tags { display: flex; gap: 0.35rem; margin-top: 0.2rem; }
    .tag-motivo, .tag-emocional { font-size: 0.65rem; padding: 1px 6px; border-radius: 10px; background: #e9ecef; color: #6c757d; }
    .gasto-monto { font-size: 0.875rem; font-weight: 600; color: #dc2626; }

    .ver-todos { font-size: 0.8rem; color: #2d9c6f; text-decoration: none; font-weight: 600; display: block; margin-top: 0.75rem; }
    .no-data { color: #adb5bd; font-size: 0.875rem; text-align: center; padding: 1rem 0; }

    .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; }
    .section-title { font-weight: 700; font-size: 1.1rem; color: #1a3a2e; }
    .section-sub { font-size: 0.8rem; color: #6c757d; }

    .metas-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .meta-card { background: #fff; border-radius: 12px; padding: 1.1rem; border: 1px solid #e9ecef; }
    .meta-header { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.75rem; }
    .meta-icon { width: 32px; height: 32px; background: #d1fae5; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .meta-icon i { color: #059669; font-size: 0.85rem; }
    .meta-info { flex: 1; }
    .meta-nombre { font-size: 0.85rem; font-weight: 600; color: #1a3a2e; }
    .meta-cat { font-size: 0.7rem; color: #6c757d; }
    .prioridad-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; font-weight: 600; flex-shrink: 0; }
    .prioridad-alta { background: #fee2e2; color: #991b1b; }
    .prioridad-media { background: #fef9c3; color: #854d0e; }
    .prioridad-baja { background: #f3f4f6; color: #6b7280; }
    .meta-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: #6c757d; margin-bottom: 0.35rem; }
    .progress-bar-wrap { height: 6px; background: #e9ecef; border-radius: 3px; margin-bottom: 0.6rem; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: #2d9c6f; border-radius: 3px; transition: width 0.4s; }
    .meta-footer { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 600; color: #374151; }
    .meta-mensual { color: #2d9c6f; }
  `],
})
export class DashboardComponent implements OnInit {
  totalIngresos = 0; totalGastos = 0;
  capacidadAhorro = 0; tasaAhorro = 0;
  ultimosGastos: Gasto[] = [];
  metas: MetaAhorro[] = [];
  metasDestacadas: MetaAhorro[] = [];
  donutData: any = null;
  donutOptions = { plugins: { legend: { position: 'bottom' } }, cutout: '65%' };
  mesActual = '';

  private categoriaColores: Record<number, string> = {
    1: '#4CAF50', 2: '#2196F3', 3: '#9C27B0',
    4: '#FF9800', 5: '#F44336', 6: '#00BCD4',
    7: '#E91E63', 8: '#795548', 9: '#607D8B',
  };
  private catMetaNombres: Record<number, string> = {
    1: 'Educación', 2: 'Salud', 3: 'Vivienda', 4: 'Recreación', 5: 'Emergencias',
  };

  constructor(
    private familiaService: FamiliaService,
    private gastosService: GastosService,
    private ingresosService: IngresosService,
    private metasService: MetasAhorroService,
  ) {}

  ngOnInit() {
    const now = new Date();
    const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.mesActual = now.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
    this.mesActual = this.mesActual.charAt(0).toUpperCase() + this.mesActual.slice(1);

    const familia = this.familiaService.familiaActual();
    if (!familia) return;

    this.ingresosService.totalMes(familia.id, mes).subscribe((r) => {
      this.totalIngresos = r.total;
      this.calcularTasa();
    });

    this.gastosService.listar(familia.id, mes).subscribe((gs) => {
      this.totalGastos = gs.reduce((s, g) => s + +g.monto, 0);
      this.ultimosGastos = gs.slice(0, 5);
      this.calcularTasa();
      this.buildDonut(gs);
    });

    this.metasService.listar(familia.id).subscribe((ms) => {
      this.metas = ms;
      this.metasDestacadas = ms.filter((m) => (m.porcentaje ?? 0) >= 50).slice(0, 2);
    });
  }

  calcularTasa() {
    this.capacidadAhorro = this.totalIngresos - this.totalGastos;
    this.tasaAhorro = this.totalIngresos > 0
      ? (this.capacidadAhorro / this.totalIngresos) * 100 : 0;
  }

  buildDonut(gastos: Gasto[]) {
    const mapa: Record<number, number> = {};
    gastos.forEach((g) => { mapa[g.categoria_id] = (mapa[g.categoria_id] ?? 0) + +g.monto; });
    const keys = Object.keys(mapa).map(Number);
    if (!keys.length) return;
    const catNombres: Record<number, string> = {
      1: 'Alimentación', 2: 'Transporte', 3: 'Vivienda',
      4: 'Servicios', 5: 'Salud', 6: 'Educación',
      7: 'Entretenimiento', 8: 'Ropa', 9: 'Otros',
    };
    this.donutData = {
      labels: keys.map((k) => catNombres[k] ?? `Cat ${k}`),
      datasets: [{ data: keys.map((k) => mapa[k]), backgroundColor: keys.map((k) => this.categoriaColores[k] ?? '#ccc'), borderWidth: 0 }],
    };
  }

  getCategoriaColor(id: number) { return this.categoriaColores[id] ?? '#e9ecef'; }
  getCatMetaNombre(id: number) { return this.catMetaNombres[id] ?? 'General'; }
  calcMensual(m: MetaAhorro) {
    if (!m.fecha_limite) return 0;
    const meses = Math.max(1, Math.ceil((new Date(m.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
    return (m.monto_objetivo - m.monto_ahorrado) / meses;
  }
}
