import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://192.168.197.81:5296/api/Admin'; // Update this to match your backend URL

  constructor(private http: HttpClient) {}

  // Updated method to handle the backend response structure
  getAllUsers(): Observable<{ id: number; username: string; role: string }[]> {
    return this.http
      .get<{
        message: string;
        users: {
          $values: { id: number; username: string; role: string }[];
        };
      }>(`${this.apiUrl}/users`)
      .pipe(
        map((response) => {
          // Extracting users.$values array
          return response.users.$values;
        }),
        catchError((error) => {
          console.error('Error fetching users:', error);
          throw error;
        })
      );
  }

  changeRole(userId: number, newRole: string): Observable<any> {
    console.log(`Sending role change request for user ${userId} to ${newRole}`);
    return this.http
      .patch(`${this.apiUrl}/updateRole?Id=${userId}`, { userId, newRole })
      .pipe(
        catchError((error) => {
          console.error('Error in changeRole:', error);
          throw error;
        })
      );
  }

  getOnlineUsers():Observable<any>{
    return this.http.get(`${this.apiUrl}/OnlineUsers`);
  }

  sendNotification(sessionId: string, message: string): Observable<any> {
    const notificationData = { sessionId, message };
    return this.http.post(`${this.apiUrl}/NotifySession`, notificationData);
  }
}
