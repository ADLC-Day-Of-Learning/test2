// Decides which countdown milestones are announced to screen-reader
// users and through which live region, extracted from GameScene so the
// routing is unit-testable on its own.

// The halfway mark, announced through the polite status region.
export const COUNTDOWN_STATUS_MILESTONE = 30;

// Time-critical milestones announced through the assertive alert
// region. Only these few seconds are urgent enough to justify
// interrupting the user: announcing each of the final ten seconds
// assertively would repeatedly truncate score and selection feedback
// for screen-reader users (WCAG 4.1.3).
export const COUNTDOWN_WARNING_MILESTONES = [10, 5];

/**
 * Announcement for a countdown milestone, or null when `remaining`
 * seconds is not a milestone. Milestones are the halfway 30-second
 * mark (polite status region) and the 10- and 5-seconds-left warnings
 * (assertive alert region, where urgency justifies interrupting).
 */
export function countdownAnnouncement(remaining) {
  if (!Number.isFinite(remaining) || remaining <= 0) {
    return null;
  }
  const isStatusMilestone = remaining === COUNTDOWN_STATUS_MILESTONE;
  const isWarning = COUNTDOWN_WARNING_MILESTONES.includes(remaining);
  if (!isStatusMilestone && !isWarning) {
    return null;
  }
  return {
    region: isWarning ? 'alert' : 'status',
    message: `${remaining} seconds remaining`,
  };
}

/**
 * Whether `remaining` seconds is a milestone that has not been
 * announced yet, given the second that was announced last. The
 * update loop ticks faster than once per second, so without this
 * dedup guard the same milestone would be announced on every frame
 * of its second. Kept pure so the guard is unit-testable.
 */
export function shouldAnnounceMilestone(remaining, lastAnnounced) {
  return countdownAnnouncement(remaining) !== null && remaining !== lastAnnounced;
}
