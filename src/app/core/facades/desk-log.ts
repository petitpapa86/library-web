import { Injectable, signal } from '@angular/core';
import { Outcome } from './outcome';

export interface DeskLogEntry {
  readonly id: number;
  readonly at: Date;
  readonly action: string;
  readonly outcome: Outcome;
}

// What happened at the desk in this session, newest first: every desk action lands here, so a librarian serving a
// queue can see the last few results at a glance. Kept in memory only.
@Injectable({ providedIn: 'root' })
export class DeskLog {
  private static readonly size = 20;
  private next = 1;
  private readonly _entries = signal<readonly DeskLogEntry[]>([]);
  readonly entries = this._entries.asReadonly();

  record(action: string, outcome: Outcome): Outcome {
    const entry: DeskLogEntry = { id: this.next++, at: new Date(), action, outcome };
    this._entries.update(entries => [entry, ...entries].slice(0, DeskLog.size));
    return outcome;
  }

  clear(): void {
    this._entries.set([]);
  }
}
