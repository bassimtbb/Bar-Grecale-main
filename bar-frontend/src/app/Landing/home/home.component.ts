import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuComponent } from '../../menu/menu.component';
import { BookTableComponent } from '../../book-table/book-table.component';
import { EventsComponent } from '../../events/events.component';
import { ContactComponent } from '../../contact/contact.component';
import { BarInfoComponent } from '../../bar-info/bar-info.component';

@Component({
  selector: 'app-home',
  imports: [MenuComponent, BookTableComponent, EventsComponent, ContactComponent, BarInfoComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
