import { Injectable } from '@angular/core';

import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root'
})
export class TerminationSignalrService {

  private hubConnection!: signalR.HubConnection;

  constructor() {}

  public startConnection(sessionId:string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`http://192.168.197.81:5296/notificationHub?sessionId=${sessionId}`,{
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR connection started'))
      .catch((err) => console.error('Error while starting SignalR connection: ' + err));
  }

  public listenForNotifications(onNotificationReceived: () => void): void {
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      console.log('Notification received:', message);
      alert(message); // Show the message in the UI
      onNotificationReceived();
      sessionStorage.clear();
      this.forceNavigationCheck();
    });
  }

  public listenForOnlineUsersUpdate(onUpdate: (users: any[]) => void): void {
    this.hubConnection.on('UpdateOnlineUsers', (onlineUsers) => {
      console.log('Updated online users:', onlineUsers);
      onUpdate(onlineUsers); // Trigger component update
    });
  }
  

  private forceNavigationCheck() {
    setTimeout(() => {
      console.log('Page is reloading...');
      window.location.reload(); // Forces Angular to re-check route guards
    }, 2000);
  }
}
