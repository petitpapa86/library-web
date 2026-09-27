import { describe, expect, it } from 'vitest';
import { rolesFrom } from './role.model';

describe('rolesFrom', () => {
  it('reads the realm roles from a multi-valued role claim', () => {
    expect(rolesFrom({ role: ['patron', 'offline_access'] })).toEqual(['patron']);
  });

  it('reads a single-valued claim', () => {
    expect(rolesFrom({ role: 'librarian' })).toEqual(['librarian']);
  });

  it('gives no role without claims', () => {
    expect(rolesFrom(null)).toEqual([]);
    expect(rolesFrom({ sub: 'x' })).toEqual([]);
  });
});
