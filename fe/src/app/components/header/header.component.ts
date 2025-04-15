import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MobileMenuService } from '../../services/mobile-menu.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {

  constructor(
    protected mobileMenuService: MobileMenuService
  ) {
  }
}
