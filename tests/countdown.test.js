import { describe, expect, it } from 'vitest';
import {
  countdownAnnouncement,
  pendingMilestoneAnnouncement,
} from '../src/game/countdown.js';

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

describe('pendingMilestoneAnnouncement', () => {
  it('returns the announcement for a milestone that was never announced', () => {
    expect(pendingMilestoneAnnouncement(30, null)).toEqual({
      region: 'status',
      message: '30 seconds remaining',
    });
    expect(pendingMilestoneAnnouncement(10, 30)).toEqual({
      region: 'alert',
      message: '10 seconds remaining',
    });
  });

  it('returns the announcement for a milestone announced after a different one', () => {
    // 30 was announced, then 10: announcing 10 is new.
    expect(pendingMilestoneAnnouncement(10, 30)).toEqual({
      region: 'alert',
      message: '10 seconds remaining',
    });
    // 10 was announced; 5 is a different milestone.
    expect(pendingMilestoneAnnouncement(5, 10)).toEqual({
      region: 'alert',
      message: '5 seconds remaining',
    });
  });

  it('does not re-announce the milestone that was announced last', () => {
    // The update loop ticks faster than once per second, so the same
    // milestone is seen on many consecutive frames.
    expect(pendingMilestoneAnnouncement(30, 30)).toBeNull();
    expect(pendingMilestoneAnnouncement(10, 10)).toBeNull();
    expect(pendingMilestoneAnnouncement(5, 5)).toBeNull();
  });

  it('does not announce non-milestone seconds', () => {
    expect(pendingMilestoneAnnouncement(29, null)).toBeNull();
    expect(pendingMilestoneAnnouncement(9, 30)).toBeNull();
    expect(pendingMilestoneAnnouncement(45, 10)).toBeNull();
  });
});
