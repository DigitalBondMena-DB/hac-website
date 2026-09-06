import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // Subject for search toggle event
  private searchToggleSubject = new Subject<boolean>();
  public searchToggle$ = this.searchToggleSubject.asObservable();

  // Subject for search query
  private searchQuerySubject = new Subject<string>();
  public searchQuery$ = this.searchQuerySubject.asObservable();

  /**
   * Notify components that search has been toggled
   * @param isOpen Whether search is open
   */
  public toggleSearch(isOpen: boolean): void {
    this.searchToggleSubject.next(isOpen);
  }

  /**
   * Update the search query
   * @param query The search query
   */
  public updateSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }
}
