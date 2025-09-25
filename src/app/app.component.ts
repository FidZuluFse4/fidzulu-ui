import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'fidzulu-ui';

  constructor(private router: Router) {}

  ngOnInit() {
    // Scroll to top when navigating to a new route
    this.router.events
      .pipe(
        // Filter to only get NavigationEnd events
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        window.scrollTo(0, 0);
      });
  }
}
