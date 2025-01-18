import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignalrService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { TerminationSignalrService } from '../../services/termination-signalr.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private signalrService: SignalrService, private authService:AuthService, private terminationRService:TerminationSignalrService) { }

  username!: string;
  userId!: number;
  role!:string;
  sessionId!:string;
  ngOnInit(): void {
    const user = sessionStorage.getItem('user');
  
    if (user) {
      const parsedUser = JSON.parse(user); // Parse the JSON string into an object
      this.username = parsedUser.username; // Extract the username
      this.userId = parsedUser.id;         // Extract the user ID
      this.role=parsedUser.role;
      this.sessionId = parsedUser.sessionId; // Extract the session ID
      this.signalrService.startConnection(this.userId);
      this.signalrService.addUserListener();
      this.terminationRService.startConnection(this.sessionId);
      this.terminationRService.listenForNotifications(() => {
        console.log('Clearing user session key from sessionStorage...');
      });
    } else {
      console.error('User is not found in session storage');
    }
  }
  
  logout(): void {
    if (this.sessionId) {
      this.authService.logout(this.sessionId).subscribe({
        next: () => {
          // Clear session storage
          sessionStorage.removeItem('isLoggedIn');
          sessionStorage.removeItem('user');
  
          // Stop SignalR connection
          this.signalrService.stopConnection();
  
          // Navigate to login
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Error logging out:', err);
        },
      });
    } else {
      console.error('Session ID is not available for logout');
    }
  }  
}
