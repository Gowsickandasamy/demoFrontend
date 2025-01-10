import { Component, OnInit } from '@angular/core';
import { SignalrService } from './services/signalr.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'demo-client';
  constructor(private signalrService: SignalrService){}
  
  ngOnInit(): void {
  }
}
