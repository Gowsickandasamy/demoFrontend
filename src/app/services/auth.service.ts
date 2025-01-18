import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SignalrService } from './signalr.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://192.168.197.81:5296/api/Auth'; // Replace with your backend API URL

  constructor(private http: HttpClient) { }

  login(Username: string, Password: string): Observable<boolean> {
    return this.getIpAddress().pipe(
      switchMap((ipAddress) => {
        const loginData = {
          Username,
          Password,
          deviceInfo: this.getDeviceInfo(),
          ipAddress,
        };
  
        return this.http
          .post<{ message: string; user?: any;  }>(
            `${this.apiUrl}/login`,
            loginData
          )
          .pipe(
            map((response) => {
              if (response.user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('user', JSON.stringify(response.user)); // Save full user details with sessionId
                return true;
              }
              return false;
            })
          );
      })
    );
  }


  private getIpAddress(): Observable<string> {
    return this.http.get<{ ip: string }>('https://api.ipify.org?format=json').pipe(
      map((data) => data.ip)
    );
  }
  
  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    return `Browser: ${this.getBrowserInfo()}, OS: ${this.getOSInfo()}`;
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Edg/')) return 'Microsoft Edge';
    if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) return 'Google Chrome';
    if (userAgent.includes('Firefox/')) return 'Mozilla Firefox';
    if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
    if (userAgent.includes('Opera/') || userAgent.includes('OPR/')) return 'Opera';
    return 'Unknown Browser';
  }
  

  private getOSInfo(): string {
    const platform = navigator.platform;
    if (platform.startsWith('Win')) return 'Windows';
    if (platform.startsWith('Mac')) return 'MacOS';
    if (platform.startsWith('Linux')) return 'Linux';
    return 'Unknown OS';
  }

  isLoggedIn(): boolean {
    return sessionStorage.getItem('isLoggedIn') === 'true';
  }

  isAdmin(): boolean {
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.role === 'Admin';
    }
    return false;
  }

  isTrainer(): boolean {
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      return parsedUser.role == "Trainer";
    }
    return false;
  }

  logout(sessionId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, { sessionId });
  }


}
