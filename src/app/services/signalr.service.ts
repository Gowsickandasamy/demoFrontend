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
    .then(()=>console.log('Connection started'))
    .catch(err => console.log('Error while starting connection: '+err))
  }
 
  public addUserListener = () => {
    this.hubConnection.on('SendMessage', (notification: Notification) => {
      console.log('Full Notification Object:', notification); // Log full object

      const { id, newRole } = notification;
      
      this.updateSessionStorage(id, newRole);

      this.toastr.warning(notification.message || 'No message provided');
      
      const currentNotifications = this.notificationsSubject.value;
      this.notificationsSubject.next([...currentNotifications, notification]);
      this.userService.getAllUsers().subscribe();
    });
  };

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