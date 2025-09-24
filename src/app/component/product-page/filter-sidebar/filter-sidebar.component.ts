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

    this.attributes.forEach((options, groupName) => {
      options.forEach((option) => {
        const controlName = `${groupName}_${option}`;
        this.filterForm.addControl(controlName, new FormControl(false));
      });
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
