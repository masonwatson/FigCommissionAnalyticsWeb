import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { DropDownListComponent, DropDownsModule } from '@progress/kendo-angular-dropdowns';

export type DropdownItem = object;

@Component({
  selector: 'app-shared-dropdown',
  standalone: true,
  imports: [DropDownsModule],
  templateUrl: './shared-dropdown.component.html',
  styleUrl: './shared-dropdown.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedDropdownComponent {
  @ViewChild(DropDownListComponent)
  private dropdown: DropDownListComponent | undefined;

  readonly options = input<readonly DropdownItem[]>([]);
  readonly dropdownId = input('dropdown');
  readonly label = input('Select');
  readonly textField = input('text');
  readonly valueField = input('value');
  readonly value = input<unknown>(0);
  readonly defaultItemLabel = input('Select One');
  readonly filterable = input(true);
  readonly valueSelected = output<unknown | null>();
  private readonly filterTerm = signal('');
  readonly defaultItem = computed<DropdownItem>(() => ({
    [this.textField()]: this.defaultItemLabel(),
    [this.valueField()]: 0,
  }));
  readonly filteredOptions = computed<readonly DropdownItem[]>(() => {
    const valueField = this.valueField();
    const textField = this.textField();
    const term = this.filterTerm().trim().toLowerCase();

    const optionsWithoutDefault = this.options().filter((item) => {
      const record = item as Record<string, unknown>;
      return record[valueField] !== 0;
    });

    if (!term) {
      return [this.defaultItem(), ...optionsWithoutDefault];
    }

    const matchedOptions = optionsWithoutDefault.filter((item) => {
      const record = item as Record<string, unknown>;
      const display = record[textField];
      return String(display ?? '').toLowerCase().includes(term);
    });

    return [this.defaultItem(), ...matchedOptions];
  });

  onValueChange(value: unknown): void {
    if (value === null || value === undefined) {
      this.valueSelected.emit(null);
      return;
    }

    if (typeof value === 'object') {
      const selectedItem = value as Record<string, unknown>;
      this.valueSelected.emit(selectedItem[this.valueField()] ?? null);
      return;
    }

    this.valueSelected.emit(value);
  }

  onFilterChange(value: string): void {
    this.filterTerm.set(value ?? '');
  }

  onBlur(): void {
    this.dropdown?.toggle(false);
  }
}
