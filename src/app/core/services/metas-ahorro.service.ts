import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MetaAhorro, CrearMetaDto, ResumenMetas } from '../../shared/models';
@Injectable({ providedIn: 'root' })
export class MetasAhorroService {
  constructor(private http: HttpClient) {}
  crear(dto: CrearMetaDto) { return this.http.post<MetaAhorro>(`${environment.apiUrl}/metas-ahorro`, dto); }
  listar(familiaId: string) { return this.http.get<MetaAhorro[]>(`${environment.apiUrl}/metas-ahorro/${familiaId}`); }
  resumen(familiaId: string) { return this.http.get<ResumenMetas>(`${environment.apiUrl}/metas-ahorro/${familiaId}/resumen`); }
  abonar(metaId: string, monto: number, nota?: string) { return this.http.patch(`${environment.apiUrl}/metas-ahorro/${metaId}/abonar`, { monto, nota }); }
  eliminar(id: string) { return this.http.delete(`${environment.apiUrl}/metas-ahorro/${id}`); }
}
