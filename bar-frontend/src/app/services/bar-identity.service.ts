import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BarTimeShift {
  label: string;
  from: string;
  to: string;
}

export interface BarTeamMember {
  name: string;
  role: string;
}

export interface BarIdentity {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  vatNumber: string;
  parkingInfo: string;
  additionalInfo: string;
  timeShifts: BarTimeShift[];
  team: BarTeamMember[];
}

const STORAGE_KEY = 'bar-identity';

const DEFAULT_IDENTITY: BarIdentity = {
  name: 'Bar Grecale',
  tagline: 'Sapori mediterranei dal 1987',
  address: 'Via del Molo 12, 16038 Santa Margherita Ligure (GE), Italia',
  phone: '+39 0185 123 4567',
  email: 'info@bar-grecale.com',
  vatNumber: 'P.IVA IT01234560980',
  parkingInfo: 'Parcheggio convenzionato con Garage Mare dalle 08:00 alle 01:00.',
  additionalInfo: 'Locale accessibile, pet-friendly e con menu dedicato ad allergie e intolleranze.',
  timeShifts: [
    { label: 'Servizio Colazione', from: '08:00', to: '11:30' },
    { label: 'Servizio Pranzo', from: '12:00', to: '15:30' },
    { label: 'Aperitivi & Lounge', from: '17:00', to: '01:00' }
  ],
  team: [
    { name: 'Lucia Ferri', role: 'General Manager' },
    { name: 'Marco Bianchi', role: 'Executive Chef' },
    { name: 'Sara Conti', role: 'Bar Manager' }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class BarIdentityService {
  private readonly identitySubject = new BehaviorSubject<BarIdentity>(this.loadFromStorage() ?? DEFAULT_IDENTITY);
  readonly identity$ = this.identitySubject.asObservable();

  get identity(): BarIdentity {
    return this.identitySubject.value;
  }

  updateIdentity(identity: BarIdentity): void {
    this.identitySubject.next(identity);
    this.persist(identity);
  }

  private persist(identity: BarIdentity): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
    } catch (err) {
      console.warn('Unable to persist bar identity in storage', err);
    }
  }

  private loadFromStorage(): BarIdentity | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as BarIdentity;
    } catch (err) {
      console.warn('Unable to read bar identity from storage', err);
      return null;
    }
  }
}
