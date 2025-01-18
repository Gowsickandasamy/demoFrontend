import { Component, OnInit,OnDestroy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SignalrService } from '../../services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TerminationSignalrService } from '../../services/termination-signalr.service';
@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrl: './online-users.component.css'
})
export class OnlineUsersComponent implements OnInit  {

  onlineUsers: any[] = [];
  errorMessage: string | null = null;
  userId!: number;
  role!:string;
  sessionId!:string;
  constructor(
    private userService: UserService,
    private signalRService: TerminationSignalrService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('user');
    if(user){
      const parsedUser = JSON.parse(user);
      this.userId = parsedUser.id;
      this.role=parsedUser.role;
      this.sessionId = parsedUser.sessionId; // Extract the session ID
    }
    this.signalRService.startConnection(this.sessionId);
    this.signalRService.listenForNotifications(() => {
      console.log('Clearing user session key from sessionStorage...');
    });
    this.fetchOnlineUsers();
    this.signalRService.listenForOnlineUsersUpdate((users) => {
      this.onlineUsers = users; // Update the online user list dynamically
    });
   
  }
  fetchOnlineUsers(): void {
    this.userService.getOnlineUsers().subscribe(
      (data) => {
        this.onlineUsers = data.$values;
      },
      (error) => {
        console.error('Error fetching online users:', error);
        this.errorMessage = 'Failed to load online users. Please try again.';
      }
    );
  }

  onNotify(sessionId: string): void {
    const notificationMessage = 'You have received a new notification!';
    this.userService.sendNotification(sessionId, notificationMessage).subscribe(
      () => {
        alert(`Notification sent to session ID: ${sessionId}`);
      },
      (error) => {
        console.error('Error sending notification:', error);
        alert('Failed to send notification. Please try again.');
      }
    );
  }

 
}

