import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SignalrService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: { id: number; username: string; role: string; newRole: string }[] = [];
  errorMessage: string | null = null;
  private notificationSubscription!: Subscription;

  username!: string;
  userId!: number;
  sessionId!: string;

  constructor(
    private userService: UserService,
    private signalrService: SignalrService
  ) {}

  ngOnInit(): void {
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      this.username = parsedUser.username;
      this.userId = parsedUser.id;
      this.sessionId = parsedUser.sessionId;
      this.signalrService.startConnection(this.userId);
      this.signalrService.addUserListener();
    } else {
      console.error('User is not found in session storage');
    }
  
    this.loadUsers();
  
    // Subscribe to notifications for real-time updates
    this.notificationSubscription = this.signalrService.notifications$.subscribe((notifications) => {
      if (notifications && notifications.length > 0) {
        const notification = notifications[0];
  
        // Update the table if the notification is for a role change
        this.handleRoleChangeNotification(notification);
      }
    });
  }
  

  ngOnDestroy(): void {
    // Unsubscribe when the component is destroyed to prevent memory leaks
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  selectedUser!: number;

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => {
        console.log('Received users:', data);
        this.users = data.map((user) => ({
          ...user,
          newRole: user.role // Default role for dropdown
        }));
      },
      (error) => {
        console.error('Error fetching users:', error);
        this.errorMessage = 'Could not fetch the user list. Please try again later.';
      }
    );
  }

  handleRoleChangeNotification(notification: any): void {
    const updatedUser = this.users.find((user) => user.id === notification.id);
    if (updatedUser) {
      updatedUser.role = notification.newRole; // Update the user role
      this.users = [...this.users]; // Trigger change detection
    }
  }
  

  changeUserRole(userId: number, newRole: string): void {
    console.log(`Changing role for user ${userId} to ${newRole}`);
    this.selectedUser = userId;
    this.signalrService.hubConnection
      .invoke('ChangeUserRole', userId, newRole) // Invoke SignalR method
      .then(() => {
        console.log(`Role change request sent for user ${userId}`);
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          user.role = newRole; // Optimistically update role
        }
      })
      .catch((err) => {
        console.error('Error invoking ChangeUserRole:', err);
        this.errorMessage =
          'Failed to update role. Please check your connection and try again.';
      });
  }
}
