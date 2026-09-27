import { Injectable, inject } from '@angular/core';
import { CopyCondition, CopyStatus } from '../models';
import { DeskService } from '../services/desk.service';
import { DeskLog } from './desk-log';
import { Outcome, attempt } from './outcome';

const whereTheCopyWent: Record<CopyStatus, string> = {
  AVAILABLE: 'back on the shelf',
  SET_ASIDE: 'set aside for a hold — put it on the hold shelf',
  IN_MAINTENANCE: 'sent to maintenance',
  ON_LOAN: 'on loan',
  LOST: 'lost',
};

// Circulation and copies at the desk (L2b, L2c, L3a–L3c). Every result goes to the desk log.
@Injectable({ providedIn: 'root' })
export class DeskFacade {
  private readonly service = inject(DeskService);
  private readonly log = inject(DeskLog);

  async checkOut(memberId: string, barcode: string): Promise<Outcome> {
    return this.run(`Check out ${barcode} to ${memberId}`, () => this.service.checkOut(memberId, barcode),
      loan => `Copy ${loan.barcode} lent to ${loan.memberId}, due ${loan.dueDate}.`);
  }

  async return(memberId: string, barcode: string, toMaintenance: boolean): Promise<Outcome> {
    return this.run(`Return ${barcode} from ${memberId}`, () => this.service.return(memberId, barcode, toMaintenance),
      r => `Copy ${r.barcode} returned, ${whereTheCopyWent[r.copyStatus]}.`);
  }

  async markLost(memberId: string, barcode: string): Promise<Outcome> {
    return this.run(`Mark ${barcode} lost`, () => this.service.markLost(memberId, barcode),
      l => `Copy ${l.barcode} marked lost; ${l.memberId} is charged the replacement fee at the next daily run.`);
  }

  async changeCondition(barcode: string, condition: CopyCondition): Promise<Outcome> {
    return this.run(`Condition of ${barcode}`, () => this.service.changeCondition(barcode, condition),
      c => `Copy ${c.barcode} is now ${c.condition.toLowerCase()}.`);
  }

  async sendToMaintenance(barcode: string): Promise<Outcome> {
    return this.run(`Maintenance for ${barcode}`, () => this.service.sendToMaintenance(barcode),
      c => `Copy ${c.barcode} is in maintenance.`);
  }

  async endMaintenance(barcode: string): Promise<Outcome> {
    return this.run(`Back in service: ${barcode}`, () => this.service.endMaintenance(barcode),
      c => `Copy ${c.barcode} is back in service, ${whereTheCopyWent[c.status]}.`);
  }

  async markFound(barcode: string): Promise<Outcome> {
    return this.run(`Found: ${barcode}`, () => this.service.markFound(barcode),
      c => `Copy ${c.barcode} found and sent to maintenance; put it back in service once checked.`);
  }

  private async run<T>(action: string, fn: () => Promise<T>, confirm: (value: T) => string): Promise<Outcome> {
    return this.log.record(action, await attempt(fn, confirm));
  }
}
