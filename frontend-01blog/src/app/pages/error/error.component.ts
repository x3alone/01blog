import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-error',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    errorCode = signal<string | number>('404');
    errorMessage = signal<string>('Page Not Found');

    // Custom messages for known codes
    private errorMap: Record<string, string> = {
        '403': 'You generally do not have permission to view this page.',
        '404': 'The page you are looking for does not exist.',
        '500': 'Something went wrong on our end.'
    };

    ngOnInit() {
        this.route.data.subscribe(data => {
            if (data['code']) {
                this.errorCode.set(data['code']);
                this.errorMessage.set(this.errorMap[data['code']] || 'An unexpected error occurred.');
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['code']) {
                this.errorCode.set(params['code']);
                this.errorMessage.set(this.errorMap[params['code']] || 'An unexpected error occurred.');
            }
        });
    }

    goHome() {
        this.router.navigate(['/']);
    }
}
