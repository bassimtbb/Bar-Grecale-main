import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;

@Component({
  selector: 'app-book-table',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './book-table.component.html',
  styleUrl: './book-table.component.css'
})
export class BookTableComponent {
  private readonly fb = inject(FormBuilder);

  readonly minDateTime: string = this.computeMinDateTime();
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | undefined>(undefined);

  readonly bookingForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(PHONE_REGEX)]],
    guests: [null as number | null, [Validators.required, Validators.min(1), Validators.max(20)]],
    reservationDateTime: ['', Validators.required],
    notes: ['', Validators.maxLength(500)]
  });

  readonly guestOptions = [
    { value: 1, label: '1 Person' },
    { value: 2, label: '2 People' },
    { value: 3, label: '3 People' },
    { value: 4, label: '4 People' },
    { value: 5, label: '5 People' },
    { value: 6, label: '6 People' },
    { value: 7, label: '7+ People' }
  ];

  submit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(undefined);
    this.submitSuccess.set(false);

    // Placeholder for future API integration; simulates a short round-trip.
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);
      this.bookingForm.reset({
        guests: null,
        reservationDateTime: ''
      });
    }, 600);
  }

  dismissAlert(): void {
    this.submitSuccess.set(false);
    this.submitError.set(undefined);
  }

  hasFieldError(controlName: keyof typeof this.bookingForm.controls): boolean {
    const control = this.bookingForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private computeMinDateTime(): string {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  }
}
