import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { Notification } from '../models/notification';
 
@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hubConnection!: signalR.HubConnection;
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  

  constructor(private toastr:ToastrService, private userService:UserService){}

  public startConnection=(userId:number) =>{
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://192.168.197.81:5296/notify?userId=${userId}`,{
        skipNegotiation:true,
        transport:signalR.HttpTransportType.WebSockets})
        .build();

        this.hubConnection
        .start()
        .then(() => {
          console.log('Connection started');
          const connectionId = this.hubConnection.connectionId;
  
          if (connectionId) {
            this.updateConnectionId(connectionId);
          }
        })
        .catch((err) => console.log('Error while starting connection: ' + err));
  }
 
  public addUserListener = () => {
    this.hubConnection.on('SendMessage', (notification: Notification) => {
      console.log('Full Notification Object:', notification);
  
      const { id, newRole } = notification;
  
      // Update session storage if needed (only for the affected user)
      this.updateSessionStorage(id, newRole);
  
      // Emit the new notification to all components subscribing to notifications
      this.notificationsSubject.next([notification]); // This will update the table for all admins
  
      // Notify only the affected user
      const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (currentUser.id === id) {
        this.toastr.warning(notification.message || 'Your role has been updated!');
      }
    });
  };
  

  private updateConnectionId(connectionId: string) {
    const sessionData = sessionStorage.getItem('user');

    if (sessionData) {
      const user = JSON.parse(sessionData);
      user.connectionId = connectionId; // Add the ConnectionId to the user object
      sessionStorage.setItem('user', JSON.stringify(user)); // Update session storage
      console.log('ConnectionId updated in session storage:', connectionId);
    } else {
      console.warn('No user found in session storage to update ConnectionId.');
    }
  }

  private updateSessionStorage(id: number, newRole: string) {
    const sessionData = sessionStorage.getItem('user');
  
    if (sessionData) {
      const user = JSON.parse(sessionData);
  
      // Check if the notification is for the logged-in user
      if (user.id === id) {
        user.role = newRole; // Update the role
        sessionStorage.setItem('user', JSON.stringify(user)); // Save updated object
        console.log('Session storage updated:', user);
        this.forceNavigationCheck();
      } else {
        console.log('Notification is not for the logged-in user. No changes made.');
      }
    } else {
      console.warn('No current user found in sessionStorage.');
    }
  }

 
  private forceNavigationCheck() {
    setTimeout(() => {
      console.log('Page is reloading...');
      window.location.reload(); // Forces Angular to re-check route guards
    }, 2000);
  }

  stopConnection() {
    if (this.hubConnection) {
      this.hubConnection
        .stop()
        .then(() => console.log('Connection stopped'))
        .catch((err) => console.error('Error while stopping connection:', err));
    }
  }

}