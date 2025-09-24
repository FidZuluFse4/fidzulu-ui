import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

// --- Angular Material Modules ---
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSliderModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.css'],
})
export class FilterSidebarComponent implements OnChanges, OnDestroy {
  @Input() attributes = new Map<string, Set<string>>();
  @Input() minPrice: number = 0;
  @Input() maxPrice: number = 1000;
  @Output() filterChange = new EventEmitter<any>();

  filterForm!: FormGroup;
  isFilterActive = false;
  private formSubscription!: Subscription;
  // Cleaned groups used by the template: filters out null/undefined/empty values
  cleanedGroups: Array<{ key: string; display: string; options: any[] }> = [];
  // Separator used to build form control names (rare string to avoid collisions)
  readonly CONTROL_SEP = '___SEP___';

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attributes'] || changes['maxPrice']) {
      this.buildForm();
    }
  }

  clearFilters(): void {
    // This function correctly calls buildForm to reset everything.
    this.buildForm();
  }

  private buildForm(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }

    this.filterForm = new FormGroup({
      price: new FormControl(this.maxPrice),
    });

    // Build cleanedGroups and add controls only for valid options
    this.cleanedGroups = [];
    this.attributes.forEach((options, groupName) => {
      const validOptions: any[] = [];
      options.forEach((option) => {
        // Filter out null/undefined and empty-string-like values (but keep 0)
        if (option === null || option === undefined) return;
        const s = String(option).trim();
        if (s === '' || s.toLowerCase() === 'null') return;
        validOptions.push(option);
      });

      if (validOptions.length > 0) {
        this.cleanedGroups.push({
          key: groupName,
          display: this.formatGroupLabel(groupName),
          options: validOptions,
        });

        validOptions.forEach((option) => {
          const controlName = this.controlName(groupName, option);
          this.filterForm.addControl(controlName, new FormControl(false));
        });
      }
    });

    this.formSubscription = this.filterForm.valueChanges.subscribe((values) => {
      this.checkIfFilterIsActive(values);
      this.filterChange.emit(values);
    });

    // THIS IS THE FIX
    // After creating the new, clean form, we must immediately emit its default
    // values so the parent page knows to update the product list.
    this.filterChange.emit(this.filterForm.value);

    this.checkIfFilterIsActive(this.filterForm.value);
  }

  controlName(group: string, option: any): string {
    return `${group}${this.CONTROL_SEP}${String(option)}`;
  }

  private formatGroupLabel(key: string): string {
    if (!key) return '';
    // If already Title case like 'Brand', return as-is
    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/.test(key)) return key;

    // Replace underscores with spaces and split camelCase
    const withSpaces = key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');

    // Title case each word
    return withSpaces
      .split(' ')
      .filter((w) => w.length > 0)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  formatOptionValue(option: any): string {
    if (option === null || option === undefined) return '';
    const s = String(option);
    // show '0' as '0', otherwise title case words
    if (/^\d+$/.test(s)) return s;
    return s
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
  }

  private checkIfFilterIsActive(values: any): void {
    if (values.price < this.maxPrice) {
      this.isFilterActive = true;
      return;
    }
    for (const key in values) {
      if (key !== 'price' && values[key] === true) {
        this.isFilterActive = true;
        return;
      }
    }
    this.isFilterActive = false;
  }
}
