import { Injectable, signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Confirmation {
    message: string;
    title?: string;
    accept: () => void;
    reject?: () => void;
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationService {
    confirmation = signal<Confirmation | null>(null);

    confirm(message: string, title: string = 'Confirm Action'): Observable<boolean> {
        const subject = new Subject<boolean>();

        this.confirmation.set({
            message,
            title,
            accept: () => {
                subject.next(true);
                subject.complete();
                this.confirmation.set(null);
            },
            reject: () => {
                subject.next(false);
                subject.complete();
                this.confirmation.set(null);
            }
        });

        return subject.asObservable();
    }
}
