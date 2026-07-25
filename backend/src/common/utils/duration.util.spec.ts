import { parseDurationToSeconds } from './duration.util';

describe('parseDurationToSeconds', () => {
  it.each([
    ['30s', 30],
    ['15m', 900],
    ['2h', 7_200],
    ['1d', 86_400],
    ['3600', 3_600],
  ])('converts %s to %i seconds', (input, expected) => {
    expect(parseDurationToSeconds(input)).toBe(expected);
  });

  it('falls back when the format is not recognised', () => {
    expect(parseDurationToSeconds('not-a-duration', 60)).toBe(60);
  });
});
