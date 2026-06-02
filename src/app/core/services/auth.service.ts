import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, Usuario } from '../../shared/models';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TK = 'katchup_token'; private readonly UK = 'katchup_user';
  currentUser = signal<Usuario | null>(this.getUserFromStorage());
  constructor(private http: HttpClient, private router: Router) {}
  login(correo: string, password: string) { return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { correo, password }).pipe(tap(r => this.saveSession(r))); }
  register(nombre_completo: string, correo: string, password: string) { return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { nombre_completo, correo, password }).pipe(tap(r => this.saveSession(r))); }
  logout() { localStorage.removeItem(this.TK); localStorage.removeItem(this.UK); this.currentUser.set(null); this.router.navigate(['/auth/login']); }
  isLoggedIn() { return !!localStorage.getItem(this.TK); }
  private saveSession(res: AuthResponse) { localStorage.setItem(this.TK, res.token); localStorage.setItem(this.UK, JSON.stringify(res.usuario)); this.currentUser.set(res.usuario); }
  private getUserFromStorage(): Usuario | null { const u = localStorage.getItem(this.UK); return u ? JSON.parse(u) : null; }
}
