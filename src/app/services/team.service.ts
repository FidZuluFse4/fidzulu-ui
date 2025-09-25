// src/app/services/team.service.ts
import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';
import { Observable, of } from 'rxjs';
import { ProductService } from './product.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  constructor(private productService: ProductService) {}

  /**
   * Fetch teams for current active category (remote). Falls back to empty array on error.
   */
  getTeams(): Observable<Team[]> {
    return this.productService.getTeamsForCategory().pipe(
      map((teams) => teams || []),
      catchError((_) => of([]))
    );
  }

  /** Explicit category version */
  getTeamsForCategory(category: string): Observable<Team[]> {
    return this.productService.getTeamsForCategory(category).pipe(
      map((teams) => teams || []),
      catchError((_) => of([]))
    );
  }
}
