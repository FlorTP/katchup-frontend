import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ReglaAutomatica } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ReglasService {
  constructor(private http: HttpClient) {}

  crear(dto: any) {
    return this.http.post<ReglaAutomatica>(`${environment.apiUrl}/reglas-automaticas`, dto);
  }

  listar(familiaId: string) {
    return this.http.get<ReglaAutomatica[]>(
      `${environment.apiUrl}/reglas-automaticas/${familiaId}`
    );
  }

  toggle(id: string) {
    return this.http.patch(`${environment.apiUrl}/reglas-automaticas/${id}/toggle`, {});
  }

  eliminar(id: string) {
    return this.http.delete(`${environment.apiUrl}/reglas-automaticas/${id}`);
  }
}
