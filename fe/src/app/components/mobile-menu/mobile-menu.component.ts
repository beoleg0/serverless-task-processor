import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MobileMenuService } from '../../services/mobile-menu.service';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileMenuComponent {

  constructor(
    protected mobileMenuService: MobileMenuService
  ) {
  }

  openDashboard(): void {
    this.mobileMenuService.openDashboard();
    this.mobileMenuService.closeMenu();
  }

  closeDashboard(): void {
    this.mobileMenuService.closeDashboard();
    this.mobileMenuService.closeMenu();
  }

}
