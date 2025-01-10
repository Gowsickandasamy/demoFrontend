import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginData ={username:'', password:''};
  errorMessage!:string;

  constructor(private authService:AuthService, private router:Router){}

  onSubmit(): void {
    this.authService.login(this.loginData.username, this.loginData.password).subscribe(
      (isAuthenticated) => {
        if (isAuthenticated) {
          this.router.navigate(['/home']); // Navigate to home page on successful login
        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'Something went wrong. Please try again later.';
      }
    );
  }

}
