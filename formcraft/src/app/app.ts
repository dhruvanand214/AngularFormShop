import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit {
  isAppLoading = signal(true);

  ngOnInit(): void {
    const minLoaderMs = 900;
    const startedAt = performance.now();

    const finishLoading = () => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minLoaderMs - elapsed);
      setTimeout(() => this.isAppLoading.set(false), remaining);
    };

    if (document.readyState === 'complete') {
      finishLoading();
      return;
    }

    window.addEventListener('load', finishLoading, { once: true });
  }
}
