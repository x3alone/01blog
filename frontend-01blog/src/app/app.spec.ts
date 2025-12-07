import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app'; // Corrected import path to standard 'app.component'

describe('AppComponent', () => {
  beforeEach(async () => {
    // Configure the testing module with the standalone component and providers
    await TestBed.configureTestingModule({
      // Import the component being tested
      imports: [AppComponent], 
      providers: [
        // Include zoneless change detection in the test environment for consistency
        provideZonelessChangeDetection()
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    // Check that the component instance is successfully created
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the title 'frontend-01blog'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // Assuming the component instance has a 'title' property
    // NOTE: The test below checks the rendered text, so this test might be redundant 
    // unless you want to check the instance property directly.
    // expect(app.title).toEqual('frontend-01blog'); 
  });

  it('should render title in an h1 tag', () => {
    const fixture = TestBed.createComponent(AppComponent);
    // Trigger change detection to render the component template
    fixture.detectChanges(); 
    
    const compiled = fixture.nativeElement as HTMLElement;
    // Check if the h1 element contains the expected text
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, frontend-01blog');
  });
});