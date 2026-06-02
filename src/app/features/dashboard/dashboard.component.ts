import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { FamiliaService } from '../../core/services/familia.service';
import { GastosService } from '../../core/services/gastos.service';
import { IngresosService } from '../../core/services/ingresos.service';
import { MetasAhorroService } from '../../core/services/metas-ahorro.service';
import { Gasto, MetaAhorro } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartModule],
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
      <div class="card">
        <div class="card-title">Distribución de Gastos</div>
        <div class="card-sub">Este mes por categoría</div>
        <p-chart type="doughnut" [data]="donutData" [options]="donutOptions" height="180px" *ngIf="donutData" />
        <div class="no-data" *ngIf="!donutData">Sin gastos este mes</div>
      </div>

      <div class="card">
        <div class="card-title">Alertas</div>
        <div class="card-sub">Notificaciones importantes</div>
        <div class="alert-item alert-warn" *ngIf="tasaAhorro < 20">
          <i class="pi pi-exclamation-triangle"></i>
          <div><div class="alert-title">Tasa de ahorro baja</div><div class="alert-msg">Tu tasa está por debajo del 20% recomendado</div></div>
        </div>
        <div class="alert-item alert-success" *ngFor="let meta of metasDestacadas">
          <i class="pi pi-check-circle"></i>
          <div><div class="alert-title">Meta: {{ meta.nombre }}</div><div class="alert-msg">Fondo al {{ meta.porcentaje }}% — ¡Vas muy bien!</div></div>
        </div>
        <div class="no-data" *ngIf="tasaAhorro >= 20 && metasDestacadas.length === 0">Sin alertas por ahora</div>
      </div>

      <div class="card">
        <div class="card-title">Últimos Gastos</div>
        <div class="card-sub">Registro reciente</div>
        <div class="gasto-item" *ngFor="let g of ultimosGastos">
          <div class="gasto-icon" [style.background]="getCatColor(g.categoria_id)"><i class="pi pi-shopping-cart"></i></div>
          <div class="gasto-info">
            <div class="gasto-desc">{{ g.descripcion }}</div>
            <div class="gasto-tags">
              <span class="tag">{{ g.motivo | titlecase }}</span>
              <span class="tag">{{ g.estado_emocional | titlecase }}</span>
            </div>
          </div>
          <div class="gasto-monto">-S/ {{ g.monto | number:'1.0-0' }}</div>
        </div>
        <a routerLink="/gastos" class="ver-todos">Ver todos →</a>
      </div>
    </div>

    <!-- Metas -->
    <div class="section-header">
      <div><div class="section-title">Metas de Ahorro</div><div class="section-sub">Progreso hacia tus objetivos</div></div>
      <a routerLink="/metas-ahorro" class="ver-todos">Ver todas →</a>
    </div>
    <div class="metas-grid">
      <div class="meta-card" *ngFor="let m of metas.slice(0,4)">
        <div class="meta-header">
          <div class="meta-icon"><i class="pi pi-bullseye"></i></div>
          <div class="meta-info">
            <div class="meta-nombre">{{ m.nombre }}</div>
            <div class="meta-cat">{{ getCatMetaNombre(m.categoria_id) }}</div>
          </div>
          <span class="prioridad-badge" [class]="'p-' + m.prioridad">{{ m.prioridad }}</span>
        </div>
        <div class="meta-progress-label"><span>Progreso</span><span>{{ m.porcentaje ?? 0 }}%</span></div>
        <div class="progress-wrap"><div class="progress-fill" [style.width.%]="m.porcentaje ?? 0"></div></div>
        <div class="meta-footer">
          <span>S/ {{ m.monto_ahorrado | number:'1.0-0' }}</span>
          <span class="meta-mensual">S/ {{ calcMensual(m) | number:'1.0-0' }}/mes</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.25rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: #1a3a2e; }
    .subtitle { color: #6c757d; font-size: .875rem; margin-top: .2rem; }

    /* KPI grid: 4 cols desktop, 2 tablet, 2 mobile */
    .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.25rem; }
    .kpi-card { background: #fff; border-radius: 12px; padding: 1.1rem; position: relative; overflow: hidden; border: 1px solid #e9ecef; }
    .kpi-label { font-size: .78rem; color: #6c757d; margin-bottom: .35rem; }
    .kpi-value { font-size: 1.5rem; font-weight: 700; }
    .kpi-sub { font-size: .72rem; color: #6c757d; margin-top: .2rem; }
    .kpi-icon { position: absolute; top: 1rem; right: 1rem; width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .kpi-green .kpi-value { color: #166534; } .kpi-green .kpi-icon { background: #dcfce7; color: #166534; }
    .kpi-red .kpi-value { color: #991b1b; } .kpi-red .kpi-icon { background: #fee2e2; color: #991b1b; }
    .kpi-teal .kpi-value { color: #0f766e; } .kpi-teal .kpi-icon { background: #ccfbf1; color: #0f766e; }
    .kpi-gray .kpi-value { color: #374151; } .kpi-gray .kpi-icon { background: #f3f4f6; color: #374151; }

    /* Charts: 3 cols desktop, 1 col tablet stacked */
    .charts-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 1rem; margin-bottom: 1.25rem; }
    .card { background: #fff; border-radius: 12px; padding: 1.1rem; border: 1px solid #e9ecef; }
    .card-title { font-weight: 600; font-size: .9rem; color: #1a3a2e; }
    .card-sub { font-size: .72rem; color: #6c757d; margin-bottom: .75rem; }
    .alert-item { display: flex; gap: .6rem; padding: .65rem; border-radius: 8px; margin-bottom: .6rem; align-items: flex-start; font-size: .8rem; }
    .alert-warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
    .alert-title { font-weight: 600; }
    .alert-msg { font-size: .72rem; margin-top: .15rem; }
    .gasto-item { display: flex; align-items: center; gap: .65rem; padding: .45rem 0; border-bottom: 1px solid #f3f4f6; }
    .gasto-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .gasto-icon i { font-size: .75rem; color: #fff; }
    .gasto-info { flex: 1; min-width: 0; }
    .gasto-desc { font-size: .8rem; font-weight: 500; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .gasto-tags { display: flex; gap: .3rem; margin-top: .15rem; }
    .tag { font-size: .62rem; padding: 1px 6px; border-radius: 10px; background: #e9ecef; color: #6c757d; }
    .gasto-monto { font-size: .825rem; font-weight: 600; color: #dc2626; flex-shrink: 0; }
    .ver-todos { font-size: .78rem; color: #2d9c6f; text-decoration: none; font-weight: 600; display: block; margin-top: .6rem; }
    .no-data { color: #adb5bd; font-size: .875rem; text-align: center; padding: 1rem 0; }

    .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: .875rem; }
    .section-title { font-weight: 700; font-size: 1rem; color: #1a3a2e; }
    .section-sub { font-size: .75rem; color: #6c757d; }

    /* Metas: 4 cols desktop, 2 tablet, 1 mobile */
    .metas-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: .875rem; }
    .meta-card { background: #fff; border-radius: 12px; padding: 1rem; border: 1px solid #e9ecef; }
    .meta-header { display: flex; align-items: flex-start; gap: .55rem; margin-bottom: .75rem; }
    .meta-icon { width: 30px; height: 30px; background: #d1fae5; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .meta-icon i { color: #059669; font-size: .8rem; }
    .meta-info { flex: 1; min-width: 0; }
    .meta-nombre { font-size: .82rem; font-weight: 600; color: #1a3a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meta-cat { font-size: .68rem; color: #6c757d; }
    .prioridad-badge { font-size: .62rem; padding: 2px 7px; border-radius: 10px; font-weight: 600; flex-shrink: 0; }
    .p-alta { background: #fee2e2; color: #991b1b; }
    .p-media { background: #fef9c3; color: #854d0e; }
    .p-baja { background: #f3f4f6; color: #6b7280; }
    .meta-progress-label { display: flex; justify-content: space-between; font-size: .72rem; color: #6c757d; margin-bottom: .3rem; }
    .progress-wrap { height: 6px; background: #e9ecef; border-radius: 3px; margin-bottom: .55rem; overflow: hidden; }
    .progress-fill { height: 100%; background: #2d9c6f; border-radius: 3px; }
    .meta-footer { display: flex; justify-content: space-between; font-size: .72rem; font-weight: 600; color: #374151; }
    .meta-mensual { color: #2d9c6f; }

    /* TABLET ≤ 1024px */
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2,1fr); }
      .charts-row { grid-template-columns: 1fr 1fr; }
      .metas-grid { grid-template-columns: repeat(2,1fr); }
      .kpi-value { font-size: 1.3rem; }
    }

    /* MOBILE ≤ 640px */
    @media (max-width: 640px) {
      .page-header h1 { font-size: 1.25rem; }
      .kpi-grid { grid-template-columns: repeat(2,1fr); gap: .625rem; }
      .kpi-card { padding: .875rem; }
      .kpi-value { font-size: 1.15rem; }
      .kpi-icon { display: none; }
      .charts-row { grid-template-columns: 1fr; }
      .metas-grid { grid-template-columns: 1fr; }
      .section-header { flex-direction: column; align-items: flex-start; gap: .25rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalIngresos = 0; totalGastos = 0; capacidadAhorro = 0; tasaAhorro = 0;
  ultimosGastos: Gasto[] = []; metas: MetaAhorro[] = []; metasDestacadas: MetaAhorro[] = [];
  donutData: any = null;
  donutOptions = { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, cutout: '65%' };
  mesActual = '';
  private catColores: Record<number,string> = {1:'#4CAF50',2:'#2196F3',3:'#9C27B0',4:'#FF9800',5:'#F44336',6:'#00BCD4',7:'#E91E63',8:'#795548',9:'#607D8B'};
  private catMetaNombres: Record<number,string> = {1:'Educación',2:'Salud',3:'Vivienda',4:'Recreación',5:'Emergencias'};
  constructor(private familiaService: FamiliaService, private gastosService: GastosService, private ingresosService: IngresosService, private metasService: MetasAhorroService) {}
  ngOnInit() {
    const now = new Date();
    const mes = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    this.mesActual = now.toLocaleString('es-PE',{month:'long',year:'numeric'});
    this.mesActual = this.mesActual.charAt(0).toUpperCase()+this.mesActual.slice(1);
    const familia = this.familiaService.familiaActual();
    if (!familia) return;
    this.ingresosService.totalMes(familia.id,mes).subscribe(r=>{this.totalIngresos=r.total;this.calcTasa();});
    this.gastosService.listar(familia.id,mes).subscribe(gs=>{this.totalGastos=gs.reduce((s,g)=>s+ +g.monto,0);this.ultimosGastos=gs.slice(0,5);this.calcTasa();this.buildDonut(gs);});
    this.metasService.listar(familia.id).subscribe(ms=>{this.metas=ms;this.metasDestacadas=ms.filter(m=>(m.porcentaje??0)>=50).slice(0,2);});
  }
  calcTasa(){this.capacidadAhorro=this.totalIngresos-this.totalGastos;this.tasaAhorro=this.totalIngresos>0?(this.capacidadAhorro/this.totalIngresos)*100:0;}
  buildDonut(gastos:Gasto[]){const m:Record<number,number>={};gastos.forEach(g=>{m[g.categoria_id]=(m[g.categoria_id]??0)+ +g.monto;});const keys=Object.keys(m).map(Number);if(!keys.length)return;const n:Record<number,string>={1:'Alimentación',2:'Transporte',3:'Vivienda',4:'Servicios',5:'Salud',6:'Educación',7:'Entretenimiento',8:'Ropa',9:'Otros'};this.donutData={labels:keys.map(k=>n[k]??`Cat ${k}`),datasets:[{data:keys.map(k=>m[k]),backgroundColor:keys.map(k=>this.catColores[k]??'#ccc'),borderWidth:0}]};}
  getCatColor(id:number){return this.catColores[id]??'#e9ecef';}
  getCatMetaNombre(id:number){return this.catMetaNombres[id]??'General';}
  calcMensual(m:MetaAhorro){if(!m.fecha_limite)return 0;const meses=Math.max(1,Math.ceil((new Date(m.fecha_limite).getTime()-Date.now())/(1000*60*60*24*30)));return(m.monto_objetivo-m.monto_ahorrado)/meses;}
}
