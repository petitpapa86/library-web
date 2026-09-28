import { Injectable, inject } from '@angular/core';
import { CopyCondition, NewTitle, TitleDraft } from '../models';
import { TitleService } from '../services/title.service';
import { DeletedTitlesFacade } from './deleted-titles.facade';
import { DeskLog } from './desk-log';
import { Outcome, attempt } from './outcome';
import { TitleCopiesFacade } from './title-copies.facade';
import { TitleSearchFacade } from './title-search.facade';

// Titles and new copies (L1a–L1d, L2a). A change reloads what it affects: the catalog search, the deleted titles
// (L1e) and the open title's copies (L2d). Every result goes to the desk log.
@Injectable({ providedIn: 'root' })
export class CatalogAdminFacade {
  private readonly service = inject(TitleService);
  private readonly search = inject(TitleSearchFacade);
  private readonly deleted = inject(DeletedTitlesFacade);
  private readonly copies = inject(TitleCopiesFacade);
  private readonly log = inject(DeskLog);

  async add(title: NewTitle): Promise<Outcome> {
    return this.run(`Add “${title.title}”`, () => this.service.add(title), t => `“${title.title}” added (ISBN ${t.isbn}).`,
      () => this.search.reload());
  }

  async update(titleId: string, draft: TitleDraft): Promise<Outcome> {
    return this.run(`Edit “${draft.title}”`, () => this.service.update(titleId, draft), t => `“${t.title}” saved.`,
      () => this.search.reload());
  }

  async remove(titleId: string, name: string): Promise<Outcome> {
    return this.run(`Delete “${name}”`, () => this.service.remove(titleId),
      () => `“${name}” deleted: hidden from search, its copies no longer lent. Restore it from Desk → Titles.`,
      () => this.titleChanged());
  }

  async restore(titleId: string): Promise<Outcome> {
    return this.run('Restore title', () => this.service.restore(titleId), t => `“${t.title}” restored.`, () => this.titleChanged());
  }

  async addCopy(titleId: string, name: string, barcode: string, condition: CopyCondition): Promise<Outcome> {
    return this.run(`Add copy to “${name}”`, () => this.service.addCopy(titleId, barcode, condition),
      c => c.status === 'SET_ASIDE'
        ? `Copy ${c.barcode} added and set aside for the first hold — put it on the hold shelf.`
        : `Copy ${c.barcode} added.`,
      () => this.copies.reload());
  }

  // Deleting or restoring moves the title between the two searches and opens or closes its copies to lending.
  private titleChanged(): void {
    this.search.reload();
    this.deleted.reload();
    this.copies.reload();
  }

  private async run<T>(action: string, fn: () => Promise<T>, confirm: (value: T) => string, reload: () => void): Promise<Outcome> {
    const outcome = await attempt(fn, confirm);
    if (outcome.ok) reload();
    return this.log.record(action, outcome);
  }
}
