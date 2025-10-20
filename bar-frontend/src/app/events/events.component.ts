import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface EventOffering {
  title: string;
  description: string;
  capacity: string;
}

interface EventHighlight {
  title: string;
  description: string;
  details: string[];
  contactCta: string;
  policyNote: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent {
  readonly eventOfferings: EventOffering[] = [
    {
      title: 'Eventi aziendali',
      description:
        'Spazi modulari per meeting, presentazioni e corsi di formazione con regia tecnica dedicata.',
      capacity: 'Capienza fino a 100 ospiti secondo la policy aziendale'
    },
    {
      title: 'Celebrazioni e matrimoni',
      description:
        'Brinda ai momenti piu importanti con menu personalizzati, luci soffuse e servizio premuroso.',
      capacity: 'Setup personalizzato per dinner place e cocktail standing'
    },
    {
      title: 'Degustazioni e lanci',
      description:
        'Accogli i tuoi partner con degustazioni guidate, press day e brand takeover in un ambiente curato.',
      capacity: 'Chef table fino a 40 ospiti - Mixology e pairing enologici'
    }
  ];

  readonly highlight: EventHighlight = {
    title: 'Spazi versatili per eventi privati',
    description:
      'Dalle partnership aziendali alle celebrazioni personali, trasformiamo i nostri ambienti in set esclusivi per raccontare il tuo brand.',
    details: [
      'Capienza massima 100 ospiti nel rispetto delle policy interne',
      'Supporto dedicato per brand partner, sponsor e fornitori esterni',
      'Tecnologia audio/video e crew on-site per dirette, talk e performance'
    ],
    contactCta: 'Vai alla sezione contatti',
    policyNote: 'Gli eventi sono organizzati nel rispetto della policy aziendale: capienza massima 100 ospiti.'
  };

  readonly showcaseImage = 'assets/event-showcase.svg';
}
