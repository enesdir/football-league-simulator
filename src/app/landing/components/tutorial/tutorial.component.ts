import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
    AccordionModule,
  ],
  templateUrl: './tutorial.component.html',
})
export class TutorialComponent {}
