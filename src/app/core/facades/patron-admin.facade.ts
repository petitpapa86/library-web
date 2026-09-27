import { Injectable, inject } from '@angular/core';
import { EnrollPatronRequest } from '../models';
import { PatronAdminService } from '../services/patron-admin.service';
import { DeskLog } from './desk-log';
import { Outcome, attempt } from './outcome';

// Patrons at the desk (L0–L0d). Every result goes to the desk log.
@Injectable({ providedIn: 'root' })
export class PatronAdminFacade {
  private readonly service = inject(PatronAdminService);
  private readonly log = inject(DeskLog);

  async enroll(request: EnrollPatronRequest): Promise<Outcome> {
    return this.run(`Enroll ${request.fullName}`, () => this.service.enroll(request),
      p => `${request.fullName} is enrolled as ${p.memberId}.`);
  }

  async changeContact(memberId: string, email: string | null, phone: string | null): Promise<Outcome> {
    return this.run(`Contact of ${memberId}`, () => this.service.changeContact(memberId, email, phone),
      c => `${c.memberId}: email ${c.email ?? 'none'}, phone ${c.phone ?? 'none'}.`);
  }

  async close(memberId: string): Promise<Outcome> {
    return this.run(`Close ${memberId}`, () => this.service.close(memberId), c => `${c.memberId} is closed.`);
  }

  async reopen(memberId: string): Promise<Outcome> {
    return this.run(`Reopen ${memberId}`, () => this.service.reopen(memberId), c => `${c.memberId} is open again.`);
  }

  async anonymise(memberId: string): Promise<Outcome> {
    return this.run(`Anonymise ${memberId}`, () => this.service.anonymise(memberId),
      a => `${a.memberId} is anonymised: name, email, phone and login are erased.`);
  }

  private async run<T>(action: string, fn: () => Promise<T>, confirm: (value: T) => string): Promise<Outcome> {
    return this.log.record(action, await attempt(fn, confirm));
  }
}
