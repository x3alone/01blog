import { Component, signal } from '@angular/core';
import { NgFor } from '@angular/common'; // <-- import NgFor

interface Post {
  title: string;
  date: string;
  content: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgFor], // <-- add NgFor here
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class App {
  protected readonly title = signal('Pixel Blog');

  protected readonly posts = signal<Post[]>([
    {
      title: 'My First Pixel Post',
      date: 'September 13, 2025',
      content: `Hello world! This is my black and white pixel-style blog.
Everything here is raw and minimal, just like retro websites.`
    },
    {
      title: 'Another Post',
      date: 'September 12, 2025',
      content: `Pixel blogs are fun because they feel like you are coding everything by hand.
No colors, no gradients, just pure black and white.`
    }
  ]);


  navigate(section: string) {
    alert(`Clicked on ${section}`);
  }
}
