import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { Familia, MiembroFamilia } from "../../shared/models";
@Injectable({ providedIn: "root" })
export class FamiliaService {
  familiaActual = signal<Familia | null>(null);
  constructor(private http: HttpClient) { }
  crearFamilia(nombre: string) {
    return this.http
      .post<Familia>(`${environment.apiUrl}/familias`, { nombre })
      .pipe(tap((f) => this.familiaActual.set(f)));
  }
  misFamilias() {
    return this.http
      .get<any[]>(`${environment.apiUrl}/familias/mis-familias`)
      .pipe(
        tap((list) => {
          if (list.length > 0) this.familiaActual.set(list[0].familia);
        }),
      );
  }
  obtenerMiembros(familiaId: string) {
    return this.http.get<MiembroFamilia[]>(
      `${environment.apiUrl}/familias/${familiaId}/miembros`,
    );
  }
  agregarMiembro(familiaId: string, dto: any) {
    return this.http.post<MiembroFamilia>(
      `${environment.apiUrl}/familias/${familiaId}/miembros`,
      dto,
    );
  }
  actualizarMiembro(familiaId: string, miembroId: string, dto: any) {
    return this.http.put(
      `${environment.apiUrl}/familias/${familiaId}/miembros/${miembroId}`,
      dto,
    );
  }
  eliminarMiembro(familiaId: string, miembroId: string) {
    return this.http.delete(
      `${environment.apiUrl}/familias/${familiaId}/miembros/${miembroId}`,
    );
  }
  obtenerCodigo(familiaId: string) {
    return this.http.get<{ codigo: string; expira_en: string }>(
      `${environment.apiUrl}/familias/${familiaId}/codigo-invitacion`,
    );
  }
  regenerarCodigo(familiaId: string) {
    return this.http.post<{ codigo: string; expira_en: string }>(
      `${environment.apiUrl}/familias/${familiaId}/codigo-invitacion/regenerar`,
      {},
    );
  }
  unirseConCodigo(codigo: string) {
    return this.http
      .post<{
        familia: Familia;
        miembro: MiembroFamilia;
      }>(`${environment.apiUrl}/familias/unirse`, { codigo })
      .pipe(tap((res) => this.familiaActual.set(res.familia)));
  }
}
