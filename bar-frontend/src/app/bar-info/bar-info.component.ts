import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { BarIdentity, BarIdentityService } from '../services/bar-identity.service';

@Component({
  selector: 'app-bar-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-info.component.html',
  styleUrl: './bar-info.component.css'
})
export class BarInfoComponent {
  readonly identity$: Observable<BarIdentity>;

  constructor(private readonly identityService: BarIdentityService) {
    this.identity$ = this.identityService.identity$;
  }

  buildPhoneLink(phone: string): string {
    const sanitized = (phone ?? '').replace(/\s+/g, '');
    return `tel:${sanitized}`;
  }

  buildEmailLink(email: string): string {
    return `mailto:${email ?? ''}`;
  }
}
