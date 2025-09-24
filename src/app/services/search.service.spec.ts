import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit updated search term', (done) => {
    const expected = 'laptop';
    service.searchTerm$.subscribe((term) => {
      if (term === expected) {
        expect(term).toBe(expected);
        done();
      }
    });
    service.updateSearchTerm(expected);
  });
});
