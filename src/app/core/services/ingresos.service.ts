import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Ingreso, CrearIngresoDto } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class IngresosService {
  constructor(private http: HttpClient) {}

  crear(dto: CrearIngresoDto) {
    return this.http.post<Ingreso>(`${environment.apiUrl}/ingresos`, dto);
  }

  listar(familiaId: string, mes?: string) {
    const params = mes ? `?mes=${mes}` : '';
    return this.http.get<Ingreso[]>(`${environment.apiUrl}/ingresos/${familiaId}${params}`);
  }

  totalMes(familiaId: string, mes: string) {
    return this.http.get<{ total: number }>(
      `${environment.apiUrl}/ingresos/${familiaId}/total?mes=${mes}`
    );
  }

  eliminar(familiaId: string, id: string) {
    return this.http.delete(`${environment.apiUrl}/ingresos/${familiaId}/${id}`);
  }
}
