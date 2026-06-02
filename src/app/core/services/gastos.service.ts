import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Gasto, CrearGastoDto } from '../../shared/models';
@Injectable({ providedIn: 'root' })
export class GastosService {
  constructor(private http: HttpClient) {}
  crear(dto: CrearGastoDto) { return this.http.post<Gasto>(`${environment.apiUrl}/gastos`, dto); }
  listar(familiaId: string, mes?: string) { const p = mes ? `?mes=${mes}` : ''; return this.http.get<Gasto[]>(`${environment.apiUrl}/gastos/${familiaId}${p}`); }
  resumenCategoria(familiaId: string, mes: string) { return this.http.get<any[]>(`${environment.apiUrl}/gastos/${familiaId}/resumen/categoria?mes=${mes}`); }
  eliminar(familiaId: string, id: string) { return this.http.delete(`${environment.apiUrl}/gastos/${familiaId}/${id}`); }
}
