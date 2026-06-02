// ============================================================
// MODELOS / INTERFACES - KatchUp Frontend
// ============================================================

export interface Usuario {
  id: string;
  nombre_completo: string;
  correo: string;
}

export interface AuthResponse {
  usuario: Usuario;
  token: string;
}

export interface Familia {
  id: string;
  nombre: string;
  creado_por: string;
  creado_en: string;
}

export type RolMiembro = 'administrador' | 'colaborador' | 'observador';

export interface MiembroFamilia {
  id: string;
  familia_id: string;
  usuario_id?: string;
  nombre_completo?: string;
  correo_invitado?: string;
  rol: RolMiembro;
  limite_gasto_mensual: number;
  gasto_actual_mes: number;
  estado: string;
  usuario?: Usuario;
}

export interface CategoriaGasto {
  id: number;
  nombre: string;
  icono: string;
  color: string;
}

export interface Gasto {
  id: string;
  familia_id: string;
  miembro_id?: string;
  categoria_id: number;
  monto: number;
  descripcion: string;
  motivo: 'necesidad' | 'impulso' | 'emergencia';
  estado_emocional: 'neutral' | 'estres' | 'celebracion';
  notas?: string;
  fecha: string;
  creado_en: string;
}

export interface CrearGastoDto {
  familia_id: string;
  miembro_id?: string;
  categoria_id: number;
  monto: number;
  descripcion: string;
  motivo: string;
  estado_emocional: string;
  notas?: string;
  fecha?: string;
}

export interface Ingreso {
  id: string;
  familia_id: string;
  monto: number;
  descripcion?: string;
  fecha: string;
}

export interface CrearIngresoDto {
  familia_id: string;
  monto: number;
  descripcion?: string;
  fecha?: string;
}

export interface MetaAhorro {
  id: string;
  familia_id: string;
  categoria_id: number;
  nombre: string;
  prioridad: 'alta' | 'media' | 'baja';
  monto_objetivo: number;
  monto_ahorrado: number;
  fecha_limite?: string;
  porcentaje?: number;
  monto_restante?: number;
}

export interface CrearMetaDto {
  familia_id: string;
  categoria_id: number;
  nombre: string;
  prioridad: string;
  monto_objetivo: number;
  fecha_limite?: string;
}

export interface ReglaAutomatica {
  id: string;
  familia_id: string;
  nombre: string;
  tipo_regla: string;
  condicion_categoria_id?: number;
  condicion_monto?: number;
  accion: string;
  meta_destino_id?: string;
  esta_activo: boolean;
}

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'alerta' | 'exito' | 'error';
  leida: boolean;
  creado_en: string;
}

export interface ResumenMensual {
  total_ingresos: number;
  total_gastos: number;
  capacidad_ahorro: number;
  tasa_ahorro: number;
}

export interface ResumenMetas {
  total_metas: number;
  total_objetivo: number;
  total_ahorrado: number;
  porcentaje_global: number;
}
