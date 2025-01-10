import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignalrService } from '../../services/signalr.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrl: './training.component.css'
})
export class TrainingComponent implements OnInit{
  constructor(private router: Router, private signalrService: SignalrService) { }

  username!: string;
  userId!: number;
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
  }
}
