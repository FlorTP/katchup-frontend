import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetasAhorroService } from '../../core/services/metas-ahorro.service';
import { FamiliaService } from '../../core/services/familia.service';
import { MetaAhorro } from '../../shared/models';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-metas-ahorro',
  standalone: true,
  imports: [CommonModule,FormsModule,ButtonModule,DialogModule,InputTextModule,DropdownModule,InputNumberModule,CalendarModule,ToastModule],
  providers: [MessageService],
  template: `
    <div class="page-header">
      <div><h1>Metas de Ahorro</h1><p class="subtitle">Planifica y alcanza tus objetivos financieros</p></div>
      <button pButton label="+ Nueva Meta" class="btn-primary" (click)="abrirModal()"></button>
    </div>

    <div class="progreso-total" *ngIf="resumen">
      <div class="prog-icon"><i class="pi pi-bullseye"></i></div>
      <div class="prog-info">
        <div class="prog-titulo">Progreso Total <span class="prog-sub">{{ resumen.total_metas }} metas activas</span></div>
        <div class="prog-label-row"><span>S/ {{ resumen.total_ahorrado | number:'1.0-0' }} / S/ {{ resumen.total_objetivo | number:'1.0-0' }}</span><span>{{ resumen.porcentaje_global }}%</span></div>
        <div class="progress-wrap"><div class="progress-fill" [style.width.%]="resumen.porcentaje_global"></div></div>
      </div>
    </div>

    <div class="metas-grid">
      <div class="meta-card" *ngFor="let m of metas">
        <div class="meta-header">
          <div class="meta-icon"><i class="pi pi-bullseye"></i></div>
          <div class="meta-info"><div class="meta-nombre">{{ m.nombre }}</div><div class="meta-cat">{{ getCatNombre(m.categoria_id) }}</div></div>
          <span class="prioridad-badge" [class]="'p-'+m.prioridad">{{ m.prioridad }}</span>
        </div>
        <div class="prog-label-row"><span>Progreso</span><span>{{ m.porcentaje ?? 0 }}%</span></div>
        <div class="progress-wrap"><div class="progress-fill" [style.width.%]="m.porcentaje??0"></div></div>
        <div class="meta-montos">
          <div><div class="monto-val">S/ {{ m.monto_ahorrado | number:'1.0-0' }}</div><div class="monto-lbl">de S/ {{ m.monto_objetivo | number:'1.0-0' }}</div></div>
          <div class="text-right"><div class="monto-val green">S/ {{ calcMensual(m) | number:'1.0-0' }}/mes</div><div class="monto-lbl">{{ m.fecha_limite ? (m.fecha_limite | date:'MMM yyyy') : 'Sin fecha' }}</div></div>
        </div>
        <div class="meta-actions">
          <button pButton label="Abonar" icon="pi pi-plus" class="btn-abonar p-button-sm" (click)="abrirAbonar(m)"></button>
          <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="eliminar(m)"></button>
        </div>
      </div>
      <div class="empty-state" *ngIf="metas.length===0"><i class="pi pi-bullseye"></i><p>No tienes metas. ¡Crea tu primera meta!</p></div>
    </div>

    <p-dialog header="Crear Meta de Ahorro" [(visible)]="modalVisible" [modal]="true" [style]="{width:'440px'}">
      <div class="form-group"><label>Nombre de la meta</label><input pInputText [(ngModel)]="form.nombre" placeholder="Ej: Vacaciones familiares" class="w-full" /></div>
      <div class="form-row">
        <div class="form-group"><label>Categoría</label><p-dropdown [options]="categorias" [(ngModel)]="form.categoria_id" optionLabel="nombre" optionValue="id" placeholder="Seleccionar" styleClass="w-full" /></div>
        <div class="form-group"><label>Prioridad</label><p-dropdown [options]="prioridades" [(ngModel)]="form.prioridad" placeholder="Seleccionar" styleClass="w-full" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Monto objetivo (S/)</label><p-inputNumber [(ngModel)]="form.monto_objetivo" mode="decimal" [minFractionDigits]="2" placeholder="0.00" styleClass="w-full" /></div>
        <div class="form-group"><label>Fecha límite</label><p-calendar [(ngModel)]="form.fecha_limite" dateFormat="dd/mm/yy" placeholder="dd/mm/aaaa" styleClass="w-full" /></div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalVisible=false"></button>
        <button pButton label="Crear Meta" class="btn-primary" [loading]="saving" (click)="guardar()"></button>
      </ng-template>
    </p-dialog>

    <p-dialog header="Registrar Abono" [(visible)]="modalAbonar" [modal]="true" [style]="{width:'340px'}">
      <div class="form-group"><label>Monto a abonar (S/)</label><p-inputNumber [(ngModel)]="montoAbono" mode="decimal" [minFractionDigits]="2" placeholder="0.00" styleClass="w-full" /></div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalAbonar=false"></button>
        <button pButton label="Confirmar Abono" class="btn-primary" [loading]="saving" (click)="confirmarAbono()"></button>
      </ng-template>
    </p-dialog>
    <p-toast />
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem}
    .page-header h1{font-size:1.5rem;font-weight:700;color:#1a3a2e;margin:0}
    .subtitle{color:#6c757d;font-size:.875rem;margin-top:.2rem}
    .btn-primary{background:#2d9c6f !important;border-color:#2d9c6f !important;border-radius:8px !important}
    .progreso-total{display:flex;gap:1rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1.1rem 1.25rem;margin-bottom:1.25rem;align-items:flex-start}
    .prog-icon{width:40px;height:40px;background:#2d9c6f;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .prog-icon i{color:#fff;font-size:1rem}
    .prog-info{flex:1;min-width:0}
    .prog-titulo{font-weight:700;font-size:.9rem;color:#1a3a2e;display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem}
    .prog-sub{font-size:.75rem;color:#6c757d;font-weight:400}
    .prog-label-row{display:flex;justify-content:space-between;font-size:.78rem;color:#6c757d;margin-bottom:.3rem}
    .progress-wrap{height:7px;background:#e9ecef;border-radius:4px;overflow:hidden;margin-bottom:.35rem}
    .progress-fill{height:100%;background:#2d9c6f;border-radius:4px;transition:width .4s}
    .metas-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
    .meta-card{background:#fff;border-radius:12px;padding:1.1rem;border:1px solid #e9ecef}
    .meta-header{display:flex;align-items:flex-start;gap:.65rem;margin-bottom:.875rem}
    .meta-icon{width:34px;height:34px;background:#d1fae5;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .meta-icon i{color:#059669;font-size:.85rem}
    .meta-info{flex:1;min-width:0}
    .meta-nombre{font-weight:700;font-size:.875rem;color:#1a3a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .meta-cat{font-size:.72rem;color:#6c757d}
    .prioridad-badge{font-size:.62rem;padding:2px 8px;border-radius:10px;font-weight:600;flex-shrink:0}
    .p-alta{background:#fee2e2;color:#991b1b}
    .p-media{background:#fef9c3;color:#854d0e}
    .p-baja{background:#f3f4f6;color:#6b7280}
    .meta-montos{display:flex;justify-content:space-between;margin-top:.65rem}
    .monto-val{font-size:.9rem;font-weight:700;color:#1a3a2e}
    .monto-val.green{color:#2d9c6f}
    .monto-lbl{font-size:.68rem;color:#6c757d}
    .text-right{text-align:right}
    .meta-actions{display:flex;justify-content:space-between;align-items:center;margin-top:.65rem}
    .btn-abonar{background:#2d9c6f !important;border-color:#2d9c6f !important;border-radius:6px !important}
    .empty-state{padding:2.5rem;text-align:center;color:#adb5bd;grid-column:span 2}
    .empty-state i{font-size:2rem;display:block;margin-bottom:.6rem}
    .form-group{margin-bottom:1rem}
    .form-group label{display:block;font-size:.875rem;font-weight:600;color:#374151;margin-bottom:.4rem}
    .form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    @media(max-width:1024px){
      .metas-grid{grid-template-columns:repeat(2,1fr)}
    }
    @media(max-width:640px){
      .page-header h1{font-size:1.25rem}
      .metas-grid{grid-template-columns:1fr}
      .progreso-total{padding:.875rem 1rem}
      .prog-icon{width:34px;height:34px}
      .form-row{grid-template-columns:1fr}
      .empty-state{grid-column:span 1}
    }
  `]
})
export class MetasAhorroComponent implements OnInit {
  metas:MetaAhorro[]=[];resumen:any=null;
  modalVisible=false;modalAbonar=false;saving=false;
  metaSeleccionada:MetaAhorro|null=null;montoAbono=0;
  form={nombre:'',categoria_id:null as any,prioridad:'',monto_objetivo:0,fecha_limite:null as any};
  categorias=[{id:1,nombre:'Educación'},{id:2,nombre:'Salud'},{id:3,nombre:'Vivienda'},{id:4,nombre:'Recreación'},{id:5,nombre:'Emergencias'}];
  prioridades=['alta','media','baja'];
  constructor(private metasService:MetasAhorroService,private familiaService:FamiliaService,private msg:MessageService){}
  ngOnInit(){this.cargar();}
  cargar(){const f=this.familiaService.familiaActual();if(!f)return;this.metasService.listar(f.id).subscribe(ms=>this.metas=ms);this.metasService.resumen(f.id).subscribe(r=>this.resumen=r);}
  abrirModal(){this.form={nombre:'',categoria_id:null,prioridad:'',monto_objetivo:0,fecha_limite:null};this.modalVisible=true;}
  guardar(){const f=this.familiaService.familiaActual();if(!f)return;this.saving=true;const dto:any={...this.form,familia_id:f.id};if(dto.fecha_limite)dto.fecha_limite=new Date(dto.fecha_limite).toISOString().split('T')[0];this.metasService.crear(dto).subscribe({next:()=>{this.modalVisible=false;this.saving=false;this.cargar();},error:()=>{this.saving=false;}});}
  abrirAbonar(m:MetaAhorro){this.metaSeleccionada=m;this.montoAbono=0;this.modalAbonar=true;}
  confirmarAbono(){if(!this.metaSeleccionada||!this.montoAbono)return;this.saving=true;this.metasService.abonar(this.metaSeleccionada.id,this.montoAbono).subscribe({next:()=>{this.modalAbonar=false;this.saving=false;this.cargar();},error:()=>{this.saving=false;}});}
  eliminar(m:MetaAhorro){this.metasService.eliminar(m.id).subscribe(()=>this.cargar());}
  getCatNombre(id:number){return this.categorias.find(c=>c.id===id)?.nombre??'';}
  calcMensual(m:MetaAhorro){if(!m.fecha_limite)return 0;const meses=Math.max(1,Math.ceil((new Date(m.fecha_limite).getTime()-Date.now())/(1000*60*60*24*30)));return(m.monto_objetivo-m.monto_ahorrado)/meses;}
}
