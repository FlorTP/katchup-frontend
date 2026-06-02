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
      <div><h1>Simulador Financiero</h1><p class="subtitle">Proyecta escenarios y toma mejores decisiones</p></div>
      <button class="btn-reiniciar" (click)="reiniciar()"><i class="pi pi-refresh"></i> Reiniciar</button>
    </div>

    <div class="sim-layout">
      <!-- Variables -->
      <div class="card variables-card">
        <div class="card-title"><i class="pi pi-sliders-h"></i> Ajustar Variables</div>
        <div class="slider-group">
          <div class="slider-label"><span>Cambio en Ingresos</span><span class="slider-val" [class.pos]="cambioIngresos>0" [class.neg]="cambioIngresos<0">{{ cambioIngresos>0?'+':'' }}{{ cambioIngresos }}%</span></div>
          <p-slider [(ngModel)]="cambioIngresos" [min]="-50" [max]="100" (onChange)="calcular()" styleClass="w-full" />
          <div class="slider-hint">Simula aumento o reducción de ingresos</div>
        </div>
        <div class="slider-group">
          <div class="slider-label"><span>Cambio en Gastos Fijos</span><span class="slider-val" [class.pos]="cambioGastos<0" [class.neg]="cambioGastos>0">{{ cambioGastos>0?'+':'' }}{{ cambioGastos }}%</span></div>
          <p-slider [(ngModel)]="cambioGastos" [min]="-50" [max]="100" (onChange)="calcular()" styleClass="w-full" />
          <div class="slider-hint">Ajusta el porcentaje de gastos fijos</div>
        </div>
        <div class="slider-group">
          <div class="slider-label"><span>Nuevo Compromiso Mensual</span><span class="slider-val">S/ {{ nuevoCompromiso | number:'1.0-0' }}</span></div>
          <p-inputNumber [(ngModel)]="nuevoCompromiso" mode="decimal" [min]="0" placeholder="0" styleClass="w-full" (ngModelChange)="calcular()" />
          <div class="slider-hint">Ej: Nuevo crédito, préstamo, suscripción</div>
        </div>
      </div>

      <!-- Resultados -->
      <div class="resultados-col">
        <!-- Escenarios -->
        <div class="escenarios-row">
          <div class="escenario-card">
            <div class="esc-label">Escenario Actual</div>
            <div class="esc-item"><span>Ingresos</span><span class="val">S/ {{ totalIngresos | number:'1.0-0' }}</span></div>
            <div class="esc-item"><span>Gastos</span><span class="val">S/ {{ totalGastos | number:'1.0-0' }}</span></div>
            <div class="esc-item"><span>Capacidad Ahorro</span><span class="val green">S/ {{ capacidadActual | number:'1.0-0' }}</span></div>
          </div>
          <div class="esc-arrow">→</div>
          <div class="escenario-card escenario-sim">
            <div class="esc-label">Escenario Simulado</div>
            <div class="esc-item"><span>Ingresos</span><span class="val">S/ {{ ingresosSimulados | number:'1.0-0' }}</span></div>
            <div class="esc-item"><span>Gastos</span><span class="val">S/ {{ gastosSimulados | number:'1.0-0' }}</span></div>
            <div class="esc-item"><span>Capacidad Ahorro</span><span class="val" [class.green]="capacidadSimulada>capacidadActual" [class.red]="capacidadSimulada<capacidadActual">S/ {{ capacidadSimulada | number:'1.0-0' }}</span></div>
          </div>
        </div>

        <!-- Impacto -->
        <div class="impacto-card" [class.pos]="diferencia>=0" [class.neg]="diferencia<0">
          <div class="impacto-icon"><i [class]="diferencia>=0?'pi pi-arrow-up-right':'pi pi-arrow-down-right'"></i></div>
          <div class="impacto-info">
            <div class="impacto-titulo">{{ diferencia>=0 ? 'Impacto Positivo' : 'Impacto Negativo' }}</div>
            <div class="impacto-desc">{{ diferencia>=0?'Aumentarías':'Reducirías' }} tu ahorro en S/ {{ (diferencia<0?-diferencia:diferencia) | number:'1.0-0' }}/mes</div>
          </div>
          <div class="tasa-box">
            <div class="tasa-label">Tasa de ahorro</div>
            <div class="tasa-val" [class.green]="tasaSimulada>=20" [class.red]="tasaSimulada<20">{{ tasaSimulada | number:'1.1-1' }}%</div>
          </div>
        </div>

        <!-- Regla 50/30/20 -->
        <div class="card">
          <div class="card-title">Regla 50 / 30 / 20</div>
          <div class="regla-grid">
            <div class="regla-item"><div class="regla-label">Necesidades (50%)</div><div class="regla-val">S/ {{ ingresosSimulados * 0.5 | number:'1.0-0' }}</div></div>
            <div class="regla-item"><div class="regla-label">Deseos (30%)</div><div class="regla-val">S/ {{ ingresosSimulados * 0.3 | number:'1.0-0' }}</div></div>
            <div class="regla-item" [class.good]="capacidadSimulada >= ingresosSimulados * 0.2"><div class="regla-label">Ahorro (20%)</div><div class="regla-val">S/ {{ ingresosSimulados * 0.2 | number:'1.0-0' }}</div></div>
          </div>
        </div>

        <!-- Proyección metas -->
        <div class="card" *ngIf="metas.length > 0">
          <div class="card-title">Proyección de Metas</div>
          <div class="meta-proj" *ngFor="let m of metas.slice(0,3)">
            <div class="meta-proj-nombre">{{ m.nombre }}</div>
            <div class="meta-proj-info">
              <span>Faltan S/ {{ (m.monto_objetivo - m.monto_ahorrado) | number:'1.0-0' }}</span>
              <span class="meta-proj-meses">≈ {{ calcMesesMeta(m) }} meses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem}
    .page-header h1{font-size:1.5rem;font-weight:700;color:#1a3a2e;margin:0}
    .subtitle{color:#6c757d;font-size:.875rem;margin-top:.2rem}
    .btn-reiniciar{display:flex;align-items:center;gap:.4rem;padding:.5rem 1rem;border:1px solid #e9ecef;border-radius:8px;background:#fff;cursor:pointer;font-size:.875rem;white-space:nowrap}
    .sim-layout{display:grid;grid-template-columns:360px 1fr;gap:1.25rem}
    .card{background:#fff;border-radius:12px;padding:1.25rem;border:1px solid #e9ecef}
    .variables-card{height:fit-content}
    .card-title{font-weight:700;font-size:.9rem;color:#1a3a2e;margin-bottom:1.1rem;display:flex;align-items:center;gap:.5rem}
    .slider-group{margin-bottom:1.4rem}
    .slider-label{display:flex;justify-content:space-between;font-size:.85rem;font-weight:500;margin-bottom:.6rem}
    .slider-val{font-weight:700}
    .slider-val.pos{color:#16a34a}
    .slider-val.neg{color:#dc2626}
    .slider-hint{font-size:.72rem;color:#9ca3af;margin-top:.4rem}
    .resultados-col{display:flex;flex-direction:column;gap:1rem}
    .escenarios-row{display:flex;align-items:center;gap:.75rem}
    .escenario-card{flex:1;background:#fff;border-radius:12px;padding:1rem;border:1px solid #e9ecef}
    .escenario-sim{border-color:#a7f3d0;background:#f0fdf4}
    .esc-label{font-weight:700;font-size:.82rem;color:#1a3a2e;margin-bottom:.65rem}
    .esc-item{display:flex;justify-content:space-between;font-size:.8rem;margin-bottom:.35rem;color:#6c757d}
    .esc-item .val{font-weight:700;color:#1a3a2e}
    .esc-item .val.green{color:#16a34a}
    .esc-item .val.red{color:#dc2626}
    .esc-arrow{font-size:1.1rem;color:#9ca3af;flex-shrink:0}
    .impacto-card{display:flex;align-items:center;gap:.875rem;padding:1rem 1.1rem;border-radius:12px;border:1px solid}
    .impacto-card.pos{background:#f0fdf4;border-color:#bbf7d0}
    .impacto-card.neg{background:#fff5f5;border-color:#fed7d7}
    .impacto-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.05);flex-shrink:0}
    .impacto-info{flex:1;min-width:0}
    .impacto-titulo{font-weight:700;font-size:.875rem}
    .impacto-desc{font-size:.78rem;color:#6c757d;margin-top:.2rem}
    .tasa-box{text-align:right;flex-shrink:0}
    .tasa-label{font-size:.72rem;color:#6c757d}
    .tasa-val{font-size:1.25rem;font-weight:800}
    .tasa-val.green{color:#16a34a}
    .tasa-val.red{color:#dc2626}
    .regla-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem;margin-top:.5rem}
    .regla-item{text-align:center;padding:.65rem;background:#f8f9fa;border-radius:8px}
    .regla-item.good{background:#f0fdf4}
    .regla-label{font-size:.72rem;font-weight:600;color:#374151}
    .regla-val{font-size:.875rem;font-weight:700;color:#6b7280;margin-top:.25rem}
    .meta-proj{padding:.5rem 0;border-bottom:1px solid #f3f4f6}
    .meta-proj:last-child{border-bottom:none}
    .meta-proj-nombre{font-weight:600;font-size:.825rem;color:#1a3a2e}
    .meta-proj-info{display:flex;justify-content:space-between;font-size:.75rem;color:#6c757d;margin-top:.2rem}
    .meta-proj-meses{color:#2d9c6f;font-weight:600}
    .green{color:#16a34a}
    .red{color:#dc2626}
    /* TABLET */
    @media(max-width:1024px){
      .sim-layout{grid-template-columns:1fr}
      .escenarios-row{gap:.5rem}
    }
    /* MOBILE */
    @media(max-width:640px){
      .page-header h1{font-size:1.25rem}
      .escenarios-row{flex-direction:column}
      .esc-arrow{transform:rotate(90deg)}
      .impacto-card{flex-wrap:wrap;gap:.625rem}
      .tasa-box{margin-left:auto}
      .regla-grid{grid-template-columns:1fr}
    }
  `]
})
export class SimuladorComponent implements OnInit {
  totalIngresos=0;totalGastos=0;
  cambioIngresos=0;cambioGastos=0;nuevoCompromiso=0;
  ingresosSimulados=0;gastosSimulados=0;
  capacidadActual=0;capacidadSimulada=0;diferencia=0;tasaSimulada=0;
  metas:MetaAhorro[]=[];
  constructor(private familiaService:FamiliaService,private ingresosService:IngresosService,private gastosService:GastosService,private metasService:MetasAhorroService){}
  ngOnInit(){
    const f=this.familiaService.familiaActual();if(!f)return;
    const mes=new Date().toISOString().slice(0,7);
    this.ingresosService.totalMes(f.id,mes).subscribe(r=>{this.totalIngresos=r.total;this.calcular();});
    this.gastosService.listar(f.id,mes).subscribe(gs=>{this.totalGastos=gs.reduce((s,g)=>s+ +g.monto,0);this.calcular();});
    this.metasService.listar(f.id).subscribe(ms=>this.metas=ms);
  }
  calcular(){this.ingresosSimulados=this.totalIngresos*(1+this.cambioIngresos/100);this.gastosSimulados=this.totalGastos*(1+this.cambioGastos/100)+this.nuevoCompromiso;this.capacidadActual=this.totalIngresos-this.totalGastos;this.capacidadSimulada=this.ingresosSimulados-this.gastosSimulados;this.diferencia=this.capacidadSimulada-this.capacidadActual;this.tasaSimulada=this.ingresosSimulados>0?(this.capacidadSimulada/this.ingresosSimulados)*100:0;}
  reiniciar(){this.cambioIngresos=0;this.cambioGastos=0;this.nuevoCompromiso=0;this.calcular();}
  calcMesesMeta(m:MetaAhorro){const r=m.monto_objetivo-m.monto_ahorrado;if(this.capacidadSimulada<=0)return'∞';return Math.ceil(r/this.capacidadSimulada);}
}
