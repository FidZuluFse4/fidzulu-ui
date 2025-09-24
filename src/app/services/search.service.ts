import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  // A BehaviorSubject holds the current search term and emits it to subscribers.
  // It starts with an empty string.
  private searchTermSource = new BehaviorSubject<string>('');

  // Expose the search term as an observable that other components can subscribe to.
  public searchTerm$ = this.searchTermSource.asObservable();

  // A method for any component to call to update the search term.
  updateSearchTerm(term: string): void {
    this.searchTermSource.next(term);
  }
}
