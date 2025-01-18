import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { UserListComponent } from './components/user-list/user-list.component';
import { adminGuard } from './guards/admin.guard';
import { TrainingComponent } from './components/training/training.component';
import { trainerGuard } from './guards/trainer.guard';
import { OnlineUsersComponent } from './components/online-users/online-users.component';

const routes: Routes = [
  { path:'', redirectTo:'/login', pathMatch:'full'},
  { path:'login',component:LoginComponent},
  { path:'home', component:HomeComponent, canActivate: [authGuard]},
  { path: 'users', component:UserListComponent, canActivate: [authGuard, adminGuard] },
  { path :'training', component:TrainingComponent, canActivate: [authGuard,trainerGuard]},
  { path: 'online-users', component: OnlineUsersComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
