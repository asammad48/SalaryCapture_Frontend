import { LuxonDatePipe } from './luxon-date.pipe';

describe('LuxonDatePipe', () => {
  it('create an instance', () => {
    const pipe = new LuxonDatePipe();
    expect(pipe).toBeTruthy();
  });
});
