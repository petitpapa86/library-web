import { Injectable, inject } from '@angular/core';
import { CopyCondition, NewTitle, TitleDraft } from '../models';
import { TitleService } from '../services/title.service';
import { DeskLog } from './desk-log';
import { Outcome, attempt } from './outcome';
import { TitleSearchFacade } from './title-search.facade';

// Titles and new copies (L1a–L1d, L2a). A change to a title refreshes the catalog search; every result goes to the
// desk log.
@Injectable({ providedIn: 'root' })
export class CatalogAdminFacade {
  private readonly service = inject(TitleService);
  private readonly search = inject(TitleSearchFacade);
  private readonly log = inject(DeskLog);

  async add(title: NewTitle): Promise<Outcome> {
    return this.run(`Add “${title.title}”`, () => this.service.add(title), t => `“${title.title}” added (ISBN ${t.isbn}).`, true);
  }

  async update(titleId: string, draft: TitleDraft): Promise<Outcome> {
    return this.run(`Edit “${draft.title}”`, () => this.service.update(titleId, draft), t => `“${t.title}” saved.`, true);
  }

  async remove(titleId: string, name: string): Promise<Outcome> {
    return this.run(`Delete “${name}”`, () => this.service.remove(titleId),
      () => `“${name}” deleted: hidden from search, its copies no longer lent. It can be restored (title id ${titleId}).`, true);
  }

  async restore(titleId: string): Promise<Outcome> {
    return this.run('Restore title', () => this.service.restore(titleId), t => `“${t.title}” restored.`, true);
  }

  async addCopy(titleId: string, name: string, barcode: string, condition: CopyCondition): Promise<Outcome> {
    return this.run(`Add copy to “${name}”`, () => this.service.addCopy(titleId, barcode, condition),
      c => c.status === 'SET_ASIDE'
        ? `Copy ${c.barcode} added and set aside for the first hold — put it on the hold shelf.`
        : `Copy ${c.barcode} added.`, false);
  }

  private async run<T>(action: string, fn: () => Promise<T>, confirm: (value: T) => string, refresh: boolean): Promise<Outcome> {
    const outcome = await attempt(fn, confirm);
    if (outcome.ok && refresh) this.search.reload();
    return this.log.record(action, outcome);
  }
}
