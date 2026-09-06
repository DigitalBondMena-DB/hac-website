import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-ramadan-loader',
  imports: [],
  templateUrl: './ramadan-loader.component.html',
  styleUrl: './ramadan-loader.component.css',
})
export class RamadanLoaderComponent implements OnInit {
  showLoader = signal(true);
  ngOnInit(): void {
    setTimeout(() => {
      this.showLoader.set(false);
    }, 3000);
  }
}
