
import { Injectable, signal, effect, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    darkMode = signal<boolean>(false);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            // Check localStorage on init
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                this.darkMode.set(true);
            } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                // Default to system preference
                // this.darkMode.set(true);
            }
        }

        // Effect to apply class
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                if (this.darkMode()) {
                    document.documentElement.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light');
                }
            }
        });
    }

    toggleTheme() {
        this.darkMode.update(v => !v);
    }
}
