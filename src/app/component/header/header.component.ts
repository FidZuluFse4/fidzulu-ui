import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms'; // <-- Import Reactive Forms
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Your new service

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // <-- Add ReactiveFormsModule
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  // We use a FormControl instead of ngModel for more power
  searchControl = new FormControl('');
  isSearchVisible = false;

  // Inject the new SearchService
  constructor(private searchService: SearchService) {}

  ngOnInit(): void {
    // This is the best practice for real-time search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Wait for 300ms after the user stops typing
        distinctUntilChanged() // Only emit if the value has actually changed
      )
      .subscribe((term) => {
        // The term will be null if the input is empty
        this.searchService.updateSearchTerm(term || '');
      });
  }

  // This function can be removed or kept for the mobile search button
  onSearch(): void {
    this.searchService.updateSearchTerm(this.searchControl.value || '');
    if (window.innerWidth < 768) {
      this.isSearchVisible = false;
    }
  }

  toggleSearch(): void {
    this.isSearchVisible = !this.isSearchVisible;
  }
}
