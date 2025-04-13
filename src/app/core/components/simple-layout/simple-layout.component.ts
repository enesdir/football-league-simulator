import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-simple-layout',
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './simple-layout.component.html',
})
export class SimpleLayoutComponent {}
