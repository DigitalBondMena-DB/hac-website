import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dismissible-badges',
  standalone: true,
  imports: [],
  templateUrl: './dismissible-badges.component.html',
  styleUrl: './dismissible-badges.component.css',
})
export class DismissibleBadgesComponent {
  @Input({ required: true }) badges: string[] = [];
  @Output() badgeRemoved = new EventEmitter<string>(); // Emit removed badge

  removeBadge(index: number): void {
    const badge = this.badges[index];
    this.badges.splice(index, 1);
    this.badgeRemoved.emit(badge); // Emit the badge value
    console.log('remove badge', badge);
  }
}
