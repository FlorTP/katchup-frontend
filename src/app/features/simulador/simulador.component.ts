import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputNumberModule } from 'primeng/inputnumber';
import { FamiliaService } from '../../core/services/familia.service';
import { IngresosService } from '../../core/services/ingresos.service';
import { GastosService } from '../../core/services/gastos.service';
import { MetasAhorroService } from '../../core/services/metas-ahorro.service';
import { MetaAhorro } from '../../shared/models';

@Component({
  selector: 'app-simulador',
  standalone: true,
  imports: [CommonModule, FormsModule, SliderModule, InputNumberModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Simulador Financiero</h1>
        <p class="subtitle">Proyecta diferentes escenarios y toma mejores decisiones</p>
      </div>
      <button class="btn-reiniciar" (click)="reiniciar()">
        <i class="pi pi-refresh"></i> Reiniciar
      </button>
    </div>

    <div class="sim-grid">
      <!-- Panel de variables -->
      <div class="card">
        <div class="card-title"><i class="pi pi-sliders-h"></i> Ajustar Variables</div>

        <div class="slider-group">
          <div class="slider-label">
            <span>Cambio en Ingresos</span>
            <span class="slider-val" [class.positive]="cambioIngresos > 0" [class.negative]="cambioIngresos < 0">
              {{ cambioIngresos > 0 ? '+' : '' }}{{ cambioIngresos }}%
            </span>
          </div>
          <p-slider [(ngModel)]="cambioIngresos" [min]="-50" [max]="100" (onChange)="calcular()" styleClass="w-full" />
          <div class="slider-hint">Simula aumento o reducción de ingresos familiares</div>
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>Cambio en Gastos Fijos</span>
            <span class="slider-val" [class.positive]="cambioGastos < 0" [class.negative]="cambioGastos > 0">
              {{ cambioGastos > 0 ? '+' : '' }}{{ cambioGastos }}%
            </span>
          </div>
          <p-slider [(ngModel)]="cambioGastos" [min]="-50" [max]="100" (onChange)="calcular()" styleClass="w-full" />
          <div class="slider-hint">Ajusta el porcentaje de gastos fijos mensuales</div>
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>Nuevo Compromiso Mensual</span>
            <span class="slider-val">S/ {{ nuevoCompromiso | number:'1.0-0' }}</span>
          </div>
          <p-inputNumber [(ngModel)]="nuevoCompromiso" mode="decimal" [min]="0"
            placeholder="0" styleClass="w-full" (ngModelChange)="calcular()" />
          <div class="slider-hint">Ej: Nuevo crédito, suscripción, préstamo familiar</div>
        </div>
      </div>

      <!-- Comparativa -->
      <div class="comparativa-col">
        <div class="escenarios-row">
          <div class="escenario-card">
            <div class="escenario-label">Escenario Actual</div>
            <div class="escenario-item">
              <span>Ingresos</span><span class="val">S/ {{ totalIngresos | number:'1.0-0' }}</span>
            </div>
            <div class="escenario-item">
              <span>Gastos</span><span class="val">S/ {{ totalGastos | number:'1.0-0' }}</span>
            </div>
            <div class="escenario-item">
              <span>Capacidad de Ahorro</span>
              <span class="val green">S/ {{ capacidadActual | number:'1.0-0' }}</span>
            </div>
          </div>

          <div class="escenario-arrow">→</div>

          <div class="escenario-card escenario-sim">
            <div class="escenario-label">Escenario Simulado</div>
            <div class="escenario-item">
              <span>Ingresos</span><span class="val">S/ {{ ingresosSimulados | number:'1.0-0' }}</span>
            </div>
            <div class="escenario-item">
              <span>Gastos</span><span class="val">S/ {{ gastosSimulados | number:'1.0-0' }}</span>
            </div>
            <div class="escenario-item">
              <span>Capacidad de Ahorro</span>
              <span class="val" [class.green]="capacidadSimulada > capacidadActual" [class.red]="capacidadSimulada < capacidadActual">
                S/ {{ capacidadSimulada | number:'1.0-0' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Impacto -->
        <div class="impacto-card" [class.impacto-positivo]="diferencia >= 0" [class.impacto-negativo]="diferencia < 0">
          <div class="impacto-icon">
            <i [class]="diferencia >= 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'"></i>
          </div>
          <div>
            <div class="impacto-titulo">{{ diferencia >= 0 ? 'Impacto Positivo' : 'Impacto Negativo' }}</div>
            <div class="impacto-desc">
              {{ diferencia >= 0 ? 'Aumentarías' : 'Reducirías' }} tu ahorro en
              S/ {{ (diferencia < 0 ? -diferencia : diferencia) | number:'1.0-0' }} mensuales
            </div>
          </div>
          <div class="tasa-simulada">
            <div class="tasa-label">Tasa de ahorro</div>
            <div class="tasa-val" [class.green]="tasaSimulada >= 20" [class.red]="tasaSimulada < 20">
              {{ tasaSimulada | number:'1.1-1' }}%
            </div>
          </div>
        </div>

        <!-- Proyección de metas -->
        <div class="metas-proyeccion">
          <div class="card-title">Proyección de Metas con este escenario</div>
          <div class="meta-proj-item" *ngFor="let m of metas.slice(0,3)">
            <div class="meta-proj-nombre">{{ m.nombre }}</div>
            <div class="meta-proj-info">
              <span>Faltan S/ {{ (m.monto_objetivo - m.monto_ahorrado) | number:'1.0-0' }}</span>
              <span class="meta-proj-meses">≈ {{ calcMesesMeta(m) }} meses con este escenario</span>
            </div>
          </div>
          <div class="no-metas" *ngIf="metas.length === 0">Sin metas activas</div>
        </div>

        <!-- Regla 50/30/20 -->
        <div class="regla-card">
          <div class="card-title">Regla 50/30/20</div>
          <div class="regla-row">
            <div class="regla-item">
              <div class="regla-label">Necesidades (50%)</div>
              <div class="regla-ideal">Ideal: S/ {{ ingresosSimulados * 0.5 | number:'1.0-0' }}</div>
            </div>
            <div class="regla-item">
              <div class="regla-label">Deseos (30%)</div>
              <div class="regla-ideal">Ideal: S/ {{ ingresosSimulados * 0.3 | number:'1.0-0' }}</div>
            </div>
            <div class="regla-item">
              <div class="regla-label">Ahorro (20%)</div>
              <div class="regla-ideal" [class.green]="capacidadSimulada >= ingresosSimulados * 0.2">
                Ideal: S/ {{ ingresosSimulados * 0.2 | number:'1.0-0' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: #1a3a2e; margin: 0; }
    .subtitle { color: #6c757d; font-size: 0.875rem; margin-top: 0.25rem; }
    .btn-reiniciar { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: 1px solid #e9ecef; border-radius: 8px; background: #fff; cursor: pointer; font-size: 0.875rem; }

    .sim-grid { display: grid; grid-template-columns: 380px 1fr; gap: 1.25rem; }
    .card { background: #fff; border-radius: 12px; padding: 1.5rem; border: 1px solid #e9ecef; }
    .card-title { font-weight: 700; font-size: 0.95rem; color: #1a3a2e; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }

    .slider-group { margin-bottom: 1.5rem; }
    .slider-label { display: flex; justify-content: space-between; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.6rem; }
    .slider-val { font-weight: 700; }
    .slider-val.positive { color: #16a34a; }
    .slider-val.negative { color: #dc2626; }
    .slider-hint { font-size: 0.75rem; color: #9ca3af; margin-top: 0.4rem; }

    .comparativa-col { display: flex; flex-direction: column; gap: 1rem; }

    .escenarios-row { display: flex; align-items: center; gap: 0.75rem; }
    .escenario-card { flex: 1; background: #fff; border-radius: 12px; padding: 1.1rem; border: 1px solid #e9ecef; }
    .escenario-sim { border-color: #a7f3d0; background: #f0fdf4; }
    .escenario-label { font-weight: 700; font-size: 0.85rem; color: #1a3a2e; margin-bottom: 0.75rem; }
    .escenario-item { display: flex; justify-content: space-between; font-size: 0.825rem; margin-bottom: 0.4rem; color: #6c757d; }
    .escenario-item .val { font-weight: 700; color: #1a3a2e; }
    .escenario-item .val.green { color: #16a34a; }
    .escenario-item .val.red { color: #dc2626; }
    .escenario-arrow { font-size: 1.25rem; color: #9ca3af; }

    .impacto-card { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid; }
    .impacto-positivo { background: #f0fdf4; border-color: #bbf7d0; }
    .impacto-negativo { background: #fff5f5; border-color: #fed7d7; }
    .impacto-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05); flex-shrink: 0; }
    .impacto-titulo { font-weight: 700; font-size: 0.9rem; }
    .impacto-desc { font-size: 0.8rem; color: #6c757d; margin-top: 0.2rem; }
    .tasa-simulada { margin-left: auto; text-align: right; }
    .tasa-label { font-size: 0.75rem; color: #6c757d; }
    .tasa-val { font-size: 1.3rem; font-weight: 800; }
    .tasa-val.green { color: #16a34a; }
    .tasa-val.red { color: #dc2626; }

    .metas-proyeccion { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e9ecef; }
    .meta-proj-item { padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; }
    .meta-proj-nombre { font-weight: 600; font-size: 0.875rem; color: #1a3a2e; }
    .meta-proj-info { display: flex; justify-content: space-between; font-size: 0.775rem; color: #6c757d; margin-top: 0.2rem; }
    .meta-proj-meses { color: #2d9c6f; font-weight: 600; }
    .no-metas { color: #adb5bd; font-size: 0.875rem; padding: 0.5rem 0; }

    .regla-card { background: #fff; border-radius: 12px; padding: 1.25rem; border: 1px solid #e9ecef; }
    .regla-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 0.75rem; }
    .regla-item { text-align: center; padding: 0.75rem; background: #f8f9fa; border-radius: 8px; }
    .regla-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
    .regla-ideal { font-size: 0.875rem; font-weight: 700; color: #6b7280; margin-top: 0.3rem; }
    .regla-ideal.green { color: #16a34a; }
    .green { color: #16a34a; }
    .red { color: #dc2626; }
  `],
})
export class SimuladorComponent implements OnInit {
  totalIngresos = 0; totalGastos = 0;
  cambioIngresos = 0; cambioGastos = 0; nuevoCompromiso = 0;
  ingresosSimulados = 0; gastosSimulados = 0;
  capacidadActual = 0; capacidadSimulada = 0;
  diferencia = 0; tasaSimulada = 0;
  metas: MetaAhorro[] = [];

  constructor(
    private familiaService: FamiliaService,
    private ingresosService: IngresosService,
    private gastosService: GastosService,
    private metasService: MetasAhorroService,
  ) {}

  ngOnInit() {
    const f = this.familiaService.familiaActual();
    if (!f) return;
    const mes = new Date().toISOString().slice(0, 7);
    this.ingresosService.totalMes(f.id, mes).subscribe((r) => {
      this.totalIngresos = r.total; this.calcular();
    });
    this.gastosService.listar(f.id, mes).subscribe((gs) => {
      this.totalGastos = gs.reduce((s, g) => s + +g.monto, 0); this.calcular();
    });
    this.metasService.listar(f.id).subscribe((ms) => (this.metas = ms));
  }

  calcular() {
    this.ingresosSimulados = this.totalIngresos * (1 + this.cambioIngresos / 100);
    this.gastosSimulados = this.totalGastos * (1 + this.cambioGastos / 100) + this.nuevoCompromiso;
    this.capacidadActual = this.totalIngresos - this.totalGastos;
    this.capacidadSimulada = this.ingresosSimulados - this.gastosSimulados;
    this.diferencia = this.capacidadSimulada - this.capacidadActual;
    this.tasaSimulada = this.ingresosSimulados > 0 ? (this.capacidadSimulada / this.ingresosSimulados) * 100 : 0;
  }

  reiniciar() { this.cambioIngresos = 0; this.cambioGastos = 0; this.nuevoCompromiso = 0; this.calcular(); }

  calcMesesMeta(m: MetaAhorro) {
    const restante = m.monto_objetivo - m.monto_ahorrado;
    if (this.capacidadSimulada <= 0) return '∞';
    return Math.ceil(restante / this.capacidadSimulada);
  }
}
