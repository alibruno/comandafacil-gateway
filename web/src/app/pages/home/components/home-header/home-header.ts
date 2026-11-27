import { NgOptimizedImage } from '@angular/common';
import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from '@openng/optimus-ui/button';
import { AuthMode } from '../../home-page.types';

@Component({
  imports: [ButtonModule, NgOptimizedImage, RouterLink],
  selector: 'app-home-header',
  templateUrl: './home-header.html',
  host: {
    class: 'relative z-10 block h-20 flex-none',
  },
})
export class HomeHeader {
  protected readonly authRequested = output<AuthMode>();

  protected openAuth(mode: AuthMode): void {
    this.authRequested.emit(mode);
  }
}