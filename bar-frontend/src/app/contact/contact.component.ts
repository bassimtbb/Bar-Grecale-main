import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { map } from 'rxjs';

import { BarIdentity, BarIdentityService } from '../services/bar-identity.service';

interface ContactMethod {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  readonly identity$;
  readonly contactMethods$;
  readonly scheduleLines$;
  readonly policyNotes$;
  readonly mapLink$;
  readonly mapEmbed$;

  constructor(
    private readonly identityService: BarIdentityService,
    private readonly sanitizer: DomSanitizer
  ) {
    this.identity$ = this.identityService.identity$;
    this.contactMethods$ = this.identity$.pipe(map(identity => this.buildContactMethods(identity)));
    this.scheduleLines$ = this.identity$.pipe(map(identity => this.buildScheduleLines(identity)));
    this.policyNotes$ = this.identity$.pipe(map(identity => this.buildPolicyNotes(identity)));
    this.mapLink$ = this.identity$.pipe(map(identity => this.buildMapsLink(identity.address)));
    this.mapEmbed$ = this.identity$.pipe(map(identity => this.buildMapsEmbed(identity.address)));
  }

  buildMapsLink(address: string): string {
    const query = address?.trim() || 'Bar Grecale Santa Margherita Ligure';
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  }

  buildMapsEmbed(address: string): SafeResourceUrl {
    const query = address?.trim() || 'Bar Grecale Santa Margherita Ligure';
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  trackByContact(_: number, method: ContactMethod): string {
    return method.value;
  }

  private buildContactMethods(identity: BarIdentity): ContactMethod[] {
    const methods: ContactMethod[] = [];

    if (identity.phone?.trim()) {
      const sanitizedPhone = identity.phone.replace(/\s+/g, '');
      methods.push({
        icon: 'bi-telephone',
        label: 'Telefono',
        value: identity.phone,
        href: `tel:${sanitizedPhone}`
      });
    }

    if (identity.email?.trim()) {
      methods.push({
        icon: 'bi-envelope-open',
        label: 'Email',
        value: identity.email,
        href: `mailto:${identity.email}`
      });
    }

    methods.push({
      icon: 'bi-chat-dots',
      label: 'Supporto WhatsApp',
      value: '+39 347 987 6543',
      href: 'https://wa.me/393479876543'
    });

    return methods;
  }

  private buildScheduleLines(identity: BarIdentity): string[] {
    if (!identity.timeShifts || identity.timeShifts.length === 0) {
      return ['Lun - Gio: 10:00 - 22:00', 'Venerdi e Sabato: 10:00 - 00:00', 'Domenica: 11:00 - 22:00'];
    }

    return identity.timeShifts.map(shift => `${shift.label}: ${shift.from} - ${shift.to}`);
  }

  private buildPolicyNotes(identity: BarIdentity): string[] {
    const notes: string[] = [];

    if (identity.additionalInfo?.trim()) {
      notes.push(identity.additionalInfo.trim());
    }

    if (identity.parkingInfo?.trim()) {
      notes.push(identity.parkingInfo.trim());
    }

    notes.push('Richieste per eventi di terzi richiedono almeno 14 giorni di preavviso.');
    return notes;
  }
}
