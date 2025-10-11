import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from '../../menu/menu.component';
import { BookTableComponent } from '../../book-table/book-table.component';

@Component({
  selector: 'app-home',
  imports: [MenuComponent, BookTableComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}

