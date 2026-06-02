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

@Component({
  selector: 'app-familia',
  standalone: true,
  imports: [CommonModule,FormsModule,ButtonModule,DialogModule,InputTextModule,DropdownModule,InputNumberModule,ToastModule],
  providers: [MessageService],
  template: `
    <div class="page-header">
      <div><h1>Grupo Familiar</h1><p class="subtitle">Administra los miembros y sus permisos</p></div>
      <button pButton label="+ Añadir" icon="pi pi-user-plus" class="btn-primary" (click)="abrirModal()"></button>
    </div>

    <!-- Top row: resumen + código -->
    <div class="top-row">
      <div class="resumen-card">
        <div><div class="resumen-titulo">Resumen del Grupo</div><div class="resumen-sub">{{ miembros.length }} miembros activos</div></div>
        <div class="gasto-total"><div class="gt-label">Gasto total</div><div class="gt-val">S/ {{ totalGastoGrupo | number:'1.0-0' }}</div></div>
      </div>
      <div class="codigo-card">
        <div class="codigo-header">
          <div><div class="codigo-titulo"><i class="pi pi-key"></i> Código de Invitación</div><div class="codigo-sub">Comparte con nuevos miembros</div></div>
          <button pButton icon="pi pi-refresh" class="p-button-text p-button-sm" (click)="regenerarCodigo()" [loading]="regenerando"></button>
        </div>
        <div class="codigo-display" *ngIf="codigo">
          <span class="codigo-text">{{ codigo }}</span>
          <button pButton [icon]="copiado?'pi pi-check':'pi pi-copy'" [label]="copiado?'Copiado':'Copiar'" class="p-button-text p-button-sm" (click)="copiarCodigo()"></button>
        </div>
        <div class="codigo-expira" *ngIf="expiraEn">Expira: {{ expiraEn | date:'dd/MM/yyyy HH:mm' }}</div>
      </div>
    </div>

    <!-- Miembros -->
    <div class="miembros-grid">
      <div class="miembro-card" *ngFor="let m of miembros">
        <div class="miembro-header">
          <div class="avatar" [style.background]="getAvatarColor(m.nombre_completo||m.usuario?.nombre_completo||'')">{{ getInitials(m.nombre_completo||m.usuario?.nombre_completo||'') }}</div>
          <div class="miembro-info">
            <div class="miembro-nombre">{{ m.nombre_completo||m.usuario?.nombre_completo }}<span class="rol-badge" [class]="'r-'+m.rol">{{ m.rol }}</span></div>
            <div class="miembro-correo">{{ m.correo_invitado||m.usuario?.correo }}</div>
            <div class="miembro-desc">{{ getRolDesc(m.rol) }}</div>
          </div>
        </div>
        <ng-container *ngIf="m.limite_gasto_mensual > 0">
          <div class="limite-label"><span>Límite gasto</span><span>S/ {{ m.gasto_actual_mes|number:'1.0-0' }} / S/ {{ m.limite_gasto_mensual|number:'1.0-0' }}</span></div>
          <div class="progress-wrap"><div class="progress-fill" [style.width.%]="getPct(m)" [class.danger]="getPct(m)>=80"></div></div>
        </ng-container>
        <div class="sin-limite" *ngIf="m.limite_gasto_mensual===0">Sin límite asignado</div>
        <div class="pendiente" *ngIf="m.estado==='invitado'"><i class="pi pi-clock"></i> Pendiente de registro</div>
        <div class="miembro-actions">
          <button pButton icon="pi pi-pencil" label="Editar" class="p-button-text p-button-sm" (click)="abrirEditar(m)"></button>
          <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="eliminar(m)"></button>
        </div>
      </div>
    </div>

    <!-- Roles -->
    <div class="roles-card">
      <div class="roles-titulo">Descripción de Roles</div>
      <div class="roles-grid">
        <div class="rol-item"><div class="rol-icon"><i class="pi pi-shield"></i></div><div><div class="rol-nombre">Administrador</div><div class="rol-desc">Acceso completo</div></div></div>
        <div class="rol-item"><div class="rol-icon edit"><i class="pi pi-pencil"></i></div><div><div class="rol-nombre">Colaborador</div><div class="rol-desc">Registra gastos e ingresos</div></div></div>
        <div class="rol-item"><div class="rol-icon view"><i class="pi pi-eye"></i></div><div><div class="rol-nombre">Observador</div><div class="rol-desc">Solo visualización</div></div></div>
      </div>
    </div>

    <p-dialog [header]="editando?'Editar Miembro':'Añadir Miembro'" [(visible)]="modalVisible" [modal]="true" [style]="{width:'440px'}">
      <div class="form-group"><label>Nombre completo</label><input pInputText [(ngModel)]="form.nombre_completo" placeholder="Nombre del miembro" class="w-full" /></div>
      <div class="form-group"><label>Correo electrónico</label><input pInputText [(ngModel)]="form.correo" type="email" placeholder="correo@ejemplo.com" class="w-full" /></div>
      <div class="form-group"><label>Rol</label><p-dropdown [options]="roles" [(ngModel)]="form.rol" optionLabel="label" optionValue="value" placeholder="Seleccionar rol" styleClass="w-full" /></div>
      <div class="form-group"><label>Límite de gasto mensual (S/) — Opcional</label><p-inputNumber [(ngModel)]="form.limite_gasto_mensual" mode="decimal" [min]="0" placeholder="0 = sin límite" styleClass="w-full" /></div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancelar" class="p-button-text" (click)="modalVisible=false"></button>
        <button pButton [label]="editando?'Guardar':'Añadir'" class="btn-primary" [loading]="saving" (click)="guardar()"></button>
      </ng-template>
    </p-dialog>
    <p-toast />
  `,
  styles: [`
    .page-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem}
    .page-header h1{font-size:1.5rem;font-weight:700;color:#1a3a2e;margin:0}
    .subtitle{color:#6c757d;font-size:.875rem;margin-top:.2rem}
    .btn-primary{background:#2d9c6f !important;border-color:#2d9c6f !important;border-radius:8px !important}
    .top-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.25rem}
    .resumen-card{display:flex;justify-content:space-between;align-items:center;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem 1.25rem}
    .resumen-titulo{font-weight:700;font-size:.9rem;color:#1a3a2e}
    .resumen-sub{font-size:.78rem;color:#6c757d}
    .gt-label{font-size:.72rem;color:#6c757d;text-align:right}
    .gt-val{font-size:1.2rem;font-weight:700;color:#1a3a2e}
    .codigo-card{background:#fff;border:1px solid #e9ecef;border-radius:12px;padding:1rem 1.25rem}
    .codigo-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.65rem}
    .codigo-titulo{font-weight:700;font-size:.875rem;color:#1a3a2e;display:flex;align-items:center;gap:.4rem}
    .codigo-sub{font-size:.72rem;color:#6c757d;margin-top:.15rem}
    .codigo-display{display:flex;align-items:center;gap:.625rem;background:#f3f4f6;border-radius:8px;padding:.55rem .875rem}
    .codigo-text{font-family:monospace;font-size:1.1rem;font-weight:700;letter-spacing:.15em;color:#1a3a2e;flex:1}
    .codigo-expira{font-size:.68rem;color:#9ca3af;margin-top:.4rem}
    .miembros-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:1.25rem}
    .miembro-card{background:#fff;border-radius:12px;padding:1.1rem;border:1px solid #e9ecef}
    .miembro-header{display:flex;gap:.65rem;margin-bottom:.75rem}
    .avatar{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.95rem;color:#fff;flex-shrink:0}
    .miembro-info{flex:1;min-width:0}
    .miembro-nombre{font-weight:700;font-size:.875rem;color:#1a3a2e;display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
    .miembro-correo{font-size:.75rem;color:#6c757d;margin-top:.15rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .miembro-desc{font-size:.7rem;color:#9ca3af;margin-top:.1rem}
    .rol-badge{font-size:.62rem;padding:2px 7px;border-radius:10px;font-weight:600}
    .r-administrador{background:#dbeafe;color:#1e40af}
    .r-colaborador{background:#fef9c3;color:#854d0e}
    .r-observador{background:#f3f4f6;color:#6b7280}
    .limite-label{display:flex;justify-content:space-between;font-size:.75rem;color:#6c757d;margin-bottom:.3rem}
    .progress-wrap{height:6px;background:#e9ecef;border-radius:3px;overflow:hidden}
    .progress-fill{height:100%;background:#2d9c6f;border-radius:3px}
    .progress-fill.danger{background:#dc2626}
    .sin-limite{font-size:.72rem;color:#9ca3af}
    .pendiente{font-size:.72rem;color:#d97706;background:#fef9c3;border-radius:6px;padding:3px 8px;display:inline-flex;align-items:center;gap:.3rem;margin-top:.4rem}
    .miembro-actions{display:flex;justify-content:flex-end;margin-top:.65rem;gap:.25rem}
    .roles-card{background:#fff;border-radius:12px;padding:1.1rem 1.25rem;border:1px solid #e9ecef}
    .roles-titulo{font-weight:700;font-size:.875rem;color:#1a3a2e;margin-bottom:.875rem}
    .roles-grid{display:flex;gap:1.5rem;flex-wrap:wrap}
    .rol-item{display:flex;align-items:center;gap:.6rem}
    .rol-icon{width:30px;height:30px;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center}
    .rol-icon.edit{background:#fef9c3}
    .rol-icon.view{background:#dbeafe}
    .rol-nombre{font-weight:600;font-size:.8rem}
    .rol-desc{font-size:.7rem;color:#6c757d}
    .form-group{margin-bottom:1rem}
    .form-group label{display:block;font-size:.875rem;font-weight:600;color:#374151;margin-bottom:.4rem}
    /* TABLET */
    @media(max-width:1024px){
      .top-row{grid-template-columns:1fr}
      .miembros-grid{grid-template-columns:repeat(2,1fr)}
    }
    /* MOBILE */
    @media(max-width:640px){
      .page-header h1{font-size:1.25rem}
      .top-row{grid-template-columns:1fr}
      .miembros-grid{grid-template-columns:1fr}
      .codigo-display{flex-wrap:wrap}
      .roles-grid{flex-direction:column;gap:.75rem}
    }
  `]
})
export class FamiliaComponent implements OnInit {
  miembros:MiembroFamilia[]=[];modalVisible=false;saving=false;editando=false;
  miembroEditando:MiembroFamilia|null=null;
  form={nombre_completo:'',correo:'',rol:'',limite_gasto_mensual:0};
  totalGastoGrupo=0;codigo='';expiraEn:string|null=null;regenerando=false;copiado=false;
  roles=[{label:'Administrador',value:'administrador'},{label:'Colaborador',value:'colaborador'},{label:'Observador',value:'observador'}];
  private avatarColors=['#2d9c6f','#3b82f6','#8b5cf6','#f59e0b','#ef4444','#06b6d4'];
  constructor(private familiaService:FamiliaService,private msg:MessageService){}
  ngOnInit(){this.cargar();}
  cargar(){const f=this.familiaService.familiaActual();if(!f)return;this.familiaService.obtenerMiembros(f.id).subscribe(ms=>{this.miembros=ms;this.totalGastoGrupo=ms.reduce((s,m)=>s+ +m.gasto_actual_mes,0);});this.familiaService.obtenerCodigo(f.id).subscribe(res=>{this.codigo=res.codigo;this.expiraEn=res.expira_en;});}
  regenerarCodigo(){const f=this.familiaService.familiaActual();if(!f)return;this.regenerando=true;this.familiaService.regenerarCodigo(f.id).subscribe({next:res=>{this.codigo=res.codigo;this.expiraEn=res.expira_en;this.regenerando=false;},error:()=>this.regenerando=false});}
  copiarCodigo(){navigator.clipboard.writeText(this.codigo);this.copiado=true;setTimeout(()=>this.copiado=false,2000);}
  abrirModal(){this.editando=false;this.miembroEditando=null;this.form={nombre_completo:'',correo:'',rol:'',limite_gasto_mensual:0};this.modalVisible=true;}
  abrirEditar(m:MiembroFamilia){this.editando=true;this.miembroEditando=m;this.form={nombre_completo:m.nombre_completo??'',correo:m.correo_invitado??'',rol:m.rol,limite_gasto_mensual:m.limite_gasto_mensual};this.modalVisible=true;}
  guardar(){const f=this.familiaService.familiaActual();if(!f)return;this.saving=true;const obs=this.editando&&this.miembroEditando?this.familiaService.actualizarMiembro(f.id,this.miembroEditando.id,this.form):this.familiaService.agregarMiembro(f.id,this.form);obs.subscribe({next:()=>{this.modalVisible=false;this.saving=false;this.cargar();},error:()=>this.saving=false});}
  eliminar(m:MiembroFamilia){const f=this.familiaService.familiaActual();if(!f)return;this.familiaService.eliminarMiembro(f.id,m.id).subscribe(()=>this.cargar());}
  getInitials(n:string){return n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();}
  getAvatarColor(n:string){return this.avatarColors[n.charCodeAt(0)%this.avatarColors.length];}
  getPct(m:MiembroFamilia){return m.limite_gasto_mensual>0?Math.min(100,(m.gasto_actual_mes/m.limite_gasto_mensual)*100):0;}
  getRolDesc(r:string){const d:Record<string,string>={administrador:'Acceso completo al sistema',colaborador:'Puede registrar gastos e ingresos',observador:'Solo visualización'};return d[r]??'';}
}
