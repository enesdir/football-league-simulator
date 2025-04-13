import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterModule, CardModule, ButtonModule, DividerModule],
  templateUrl: './welcome.component.html',
})
export class WelcomeComponent {}
