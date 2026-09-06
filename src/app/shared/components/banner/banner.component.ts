import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BannerSkeletonComponent } from '@shared/components/skeleton/banner-skeleton/banner-skeleton.component';
import { BaseBannerComponent } from '@shared/ts/baseBanner';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, BannerSkeletonComponent],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css',
})
export class BannerComponent extends BaseBannerComponent {}
