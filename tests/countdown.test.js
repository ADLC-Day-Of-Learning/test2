import { describe, expect, it } from 'vitest';
import { countdownAnnouncement } from '../src/game/countdown.js';

describe('countdownAnnouncement', () => {
  it('routes the halfway milestone to the status region', () => {
    expect(countdownAnnouncement(30)).toEqual({
      region: 'status',
      message: '30 seconds remaining',
    });
  });

  it('routes the 10- and 5-seconds-left warnings to the alert region', () => {
    expect(countdownAnnouncement(10)).toEqual({
      region: 'alert',
      message: '10 seconds remaining',
    });
    expect(countdownAnnouncement(5)).toEqual({
      region: 'alert',
      message: '5 seconds remaining',
    });
  });

  it('does not announce every one of the final seconds', () => {
    // Per-second announcements would flood screen-reader users with
    // interruptions (WCAG 4.1.3); only the key milestones are announced.
    expect(countdownAnnouncement(9)).toBeNull();
    expect(countdownAnnouncement(2)).toBeNull();
    expect(countdownAnnouncement(1)).toBeNull();
  });

  it('returns null for non-milestone seconds', () => {
    expect(countdownAnnouncement(60)).toBeNull();
    expect(countdownAnnouncement(45)).toBeNull();
    expect(countdownAnnouncement(31)).toBeNull();
    expect(countdownAnnouncement(29)).toBeNull();
    expect(countdownAnnouncement(11)).toBeNull();
  });

  it('returns null at and below zero', () => {
    expect(countdownAnnouncement(0)).toBeNull();
    expect(countdownAnnouncement(-5)).toBeNull();
  });

  it('returns null for invalid input', () => {
    expect(countdownAnnouncement(Number.NaN)).toBeNull();
    expect(countdownAnnouncement(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
