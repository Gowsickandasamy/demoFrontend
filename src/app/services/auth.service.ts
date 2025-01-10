import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://192.168.197.81:5296/api/Auth'; // Replace with your backend API URL

  constructor(private http: HttpClient) {}

  // Login function
  login(Username: string, Password: string): Observable<boolean> {
    return this.http
      .post<{ message: string; user?: any }>(`${this.apiUrl}/login`, { Username, Password })
      .pipe(
        map((response) => {
          if (response.user) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('user', JSON.stringify(response.user)); // Save user details if needed
            return true;
          }
          return false;
        })
      );
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

  isTrainer():boolean{
    const user = sessionStorage.getItem('user');
    if(user){
      const parsedUser=JSON.parse(user);
      return parsedUser.role=="Trainer";
    }
    return false;
  }
  
  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  }
}
