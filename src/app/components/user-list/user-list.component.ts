import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SignalrService } from '../../services/signalr.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit{
  users: { id: number; username: string; role: string; newRole: string }[] = [];
  errorMessage: string | null = null;
 
  username!: string;
  userId!: number;

  constructor(private userService: UserService,private signalrService:SignalrService) {
  }

  ngOnInit(): void {    
    const user = sessionStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user); // Parse the JSON string into an object
      this.username = parsedUser.username; // Extract the username
      this.userId = parsedUser.id;
      this.signalrService.startConnection(this.userId);
      this.signalrService.addUserListener();
    }
    else {
      console.error('User is not found in session storage');
    }

    this.loadUsers();
  }

  selectedUser!:number;
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(
      (data) => {
        console.log('Received users:', data);
        this.users = data.map(user => ({
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


  changeUserRole(userId: number, newRole: string): void {
    console.log(`Changing role for user ${userId} to ${newRole}`);
    this.selectedUser=userId;
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

