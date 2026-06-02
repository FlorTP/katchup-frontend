import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notificacion } from '../../shared/models';
@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  noLeidas = signal<number>(0);
  constructor(private http: HttpClient) {}
  listar() { return this.http.get<Notificacion[]>(`${environment.apiUrl}/notificaciones`); }
  contarNoLeidas() { return this.http.get<{ count: number }>(`${environment.apiUrl}/notificaciones/no-leidas`).pipe(tap(r => this.noLeidas.set(r.count))); }
  marcarLeida(id: string) { return this.http.patch(`${environment.apiUrl}/notificaciones/${id}/leer`, {}); }
  marcarTodas() { return this.http.patch(`${environment.apiUrl}/notificaciones/leer-todas`, {}); }
}
