import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CopyCondition, TitleDraft, TitleSummary, copyConditions } from '../../../core/models';

type Panel = 'edit' | 'copy' | 'delete' | null;

// A librarian's controls on one catalog card: edit (L1b, the ISBN stays), add a copy (L2a), delete (L1c, asks first).
@Component({
  selector: 'app-title-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="card-actions">
      <button type="button" [class.active-toggle]="panel() === 'copy'" (click)="open('copy')">Add copy</button>
      <button type="button" [class.active-toggle]="panel() === 'edit'" (click)="open('edit')">Edit</button>
      <button type="button" class="danger-button" [class.active-toggle]="panel() === 'delete'" (click)="open('delete')">Delete</button>
    </div>
    @switch (panel()) {
      @case ('edit') {
        <form class="panel stack" [formGroup]="edit" (ngSubmit)="saveEdit()">
          <label>Title <input formControlName="title" /></label>
          <div class="grid-2">
            <label>Author <input formControlName="author" /></label>
            <label>Genre <input formControlName="genre" /></label>
          </div>
          <div class="actions">
            <button type="submit" class="primary" [disabled]="edit.invalid || busy()">Save</button>
            <button type="button" (click)="panel.set(null)">Cancel</button>
          </div>
        </form>
      }
      @case ('copy') {
        <form class="panel actions" [formGroup]="copy" (ngSubmit)="saveCopy()">
          <input formControlName="barcode" placeholder="Barcode" aria-label="Barcode" autocomplete="off" />
          <select formControlName="condition" aria-label="Condition">
            @for (c of conditions; track c) { <option [value]="c">{{ c.toLowerCase() }}</option> }
          </select>
          <button type="submit" class="primary" [disabled]="copy.invalid || busy()">Add copy</button>
        </form>
      }
      @case ('delete') {
        <div class="panel actions">
          <span>Hide “{{ title().title }}” from search and stop lending its copies? It can be restored later.</span>
          <button type="button" class="danger-button" [disabled]="busy()" (click)="remove.emit(); panel.set(null)">Delete</button>
          <button type="button" (click)="panel.set(null)">Keep</button>
        </div>
      }
    }
  `,
})
export class TitleAdminComponent {
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly title = input.required<TitleSummary>();
  readonly busy = input(false);
  readonly save = output<TitleDraft>();
  readonly addCopy = output<{ barcode: string; condition: CopyCondition }>();
  readonly remove = output<void>();

  protected readonly panel = signal<Panel>(null);
  protected readonly conditions = copyConditions;
  protected readonly edit = this.fb.group({
    title: ['', Validators.required], author: ['', Validators.required], genre: ['', Validators.required],
  });
  protected readonly copy = this.fb.group({ barcode: ['', Validators.required], condition: ['NEW' as CopyCondition] });

  protected open(panel: Exclude<Panel, null>): void {
    if (this.panel() === panel) {
      this.panel.set(null);
      return;
    }
    if (panel === 'edit') {
      const { title, author, genre } = this.title();
      this.edit.setValue({ title, author, genre });
    }
    if (panel === 'copy') this.copy.reset();
    this.panel.set(panel);
  }

  protected saveEdit(): void {
    if (this.edit.invalid) return;
    const v = this.edit.getRawValue();
    this.save.emit({ title: v.title.trim(), author: v.author.trim(), genre: v.genre.trim() });
    this.panel.set(null);
  }

  protected saveCopy(): void {
    if (this.copy.invalid) return;
    const { barcode, condition } = this.copy.getRawValue();
    this.addCopy.emit({ barcode: barcode.trim(), condition });
    this.copy.controls.barcode.reset();
  }
}
