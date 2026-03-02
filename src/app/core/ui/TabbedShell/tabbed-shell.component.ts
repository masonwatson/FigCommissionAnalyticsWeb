import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SelectEvent, TabStripModule } from '@progress/kendo-angular-layout';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tabbed-shell',
  standalone: true,
  imports: [RouterOutlet, TabStripModule],
  templateUrl: './tabbed-shell.component.html',
  styleUrl: './tabbed-shell.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabbedShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly tabRoutes = [
    '/financial-advisor-summary',
    '/monthly-trend',
    '/insurance-carrier-breakdown',
  ] as const;

  protected readonly selectedTabIndex = signal(this.getTabIndexFromUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.selectedTabIndex.set(this.getTabIndexFromUrl(event.urlAfterRedirects));
      });
  }

  protected onTabSelect(event: SelectEvent): void {
    const route = this.tabRoutes[event.index] ?? this.tabRoutes[0];
    this.selectedTabIndex.set(event.index);
    void this.router.navigateByUrl(route);
  }

  private getTabIndexFromUrl(url: string): number {
    const index = this.tabRoutes.findIndex((route) => url.startsWith(route));
    return index >= 0 ? index : 0;
  }
}