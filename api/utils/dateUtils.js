const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get friendly date label: Today, Tomorrow, Wednesday in 2 days, etc.
 * @param {Date} targetDate - The date to format
 * @param {Date} [referenceDate] - The reference date (defaults to today)
 * @returns {string} Friendly date label like "Today(1/26)" or "Friday in 4 days(1/30)"
 */
function getFriendlyDateLabel(targetDate, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const month = target.getMonth() + 1;
  const day = target.getDate();
  const dateStr = `${month}/${day}`;
  const dayName = DAY_NAMES[target.getDay()];

  if (diffDays === 0) {
    return `Today(${dateStr})`;
  } else if (diffDays === 1) {
    return `Tomorrow(${dateStr})`;
  } else if (diffDays > 1 && diffDays <= 6) {
    return `${dayName} in ${diffDays} days(${dateStr})`;
  } else if (diffDays === -1) {
    return `Yesterday(${dateStr})`;
  } else {
    return `${dayName}(${dateStr})`;
  }
}

/**
 * Parse a day name and get the friendly label assuming the next occurrence
 * @param {string} dayName - Day name like "Monday", "Tuesday", etc.
 * @param {Date} [referenceDate] - The reference date (defaults to today)
 * @returns {string} Friendly date label
 */
function getDayNameAsFriendlyLabel(dayName, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const dayNameToIndex = {};
  DAY_NAMES.forEach((name, i) => { dayNameToIndex[name.toLowerCase()] = i; });

  const mentionedDayIndex = dayNameToIndex[dayName.toLowerCase()];
  if (mentionedDayIndex === undefined) return dayName;

  const todayDayIndex = today.getDay();

  // Calculate days until the mentioned day (assume future, within next 7 days)
  let daysUntil = mentionedDayIndex - todayDayIndex;
  if (daysUntil < 0) daysUntil += 7;

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntil);

  return getFriendlyDateLabel(targetDate, today);
}

/**
 * Parse a date string (M/D or M/D/YYYY) and get the friendly label
 * @param {number} month - Month (1-12)
 * @param {number} day - Day of month
 * @param {number} [year] - Year (defaults to current year)
 * @param {Date} [referenceDate] - The reference date (defaults to today)
 * @returns {string} Friendly date label
 */
function getDateAsFriendlyLabel(month, day, year, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const fullYear = year ? (year < 100 ? 2000 + year : year) : today.getFullYear();
  const targetDate = new Date(fullYear, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  return getFriendlyDateLabel(targetDate, today);
}

/**
 * Format date as "Monday January 26, 2026 at 11:09:30 AM"
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
function formatLastUpdated(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) {
      return formatLastUpdated(new Date());
    }
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const formatted = date.toLocaleString('en-US', options);
    // Format: "Monday, January 26, 2026 at 11:09:30 AM" -> "Monday January 26, 2026 at 11:09:30 AM"
    return formatted.replace(/^(\w+),\s*/, '$1 ');
  } catch {
    return formatLastUpdated(new Date());
  }
}

/**
 * Get relative time label: "2 hours ago", "in 3 days", etc.
 * @param {Date} targetDate - The date to compare
 * @param {Date} [referenceDate] - The reference date (defaults to now)
 * @returns {string} Relative time label
 */
function getRelativeTimeLabel(targetDate, referenceDate = new Date()) {
  const target = new Date(targetDate);
  const ref = new Date(referenceDate);

  const diffMs = target.getTime() - ref.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // Future
  if (diffMs > 0) {
    if (diffSeconds < 60) return `in ${diffSeconds} seconds`;
    if (diffMinutes < 60) return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 30) return `in ${Math.round(diffDays / 7)} week${Math.round(diffDays / 7) !== 1 ? 's' : ''}`;
    if (diffDays < 365) return `in ${Math.round(diffDays / 30)} month${Math.round(diffDays / 30) !== 1 ? 's' : ''}`;
    return `in ${Math.round(diffDays / 365)} year${Math.round(diffDays / 365) !== 1 ? 's' : ''}`;
  }

  // Past
  const absDiffSeconds = Math.abs(diffSeconds);
  const absDiffMinutes = Math.abs(diffMinutes);
  const absDiffHours = Math.abs(diffHours);
  const absDiffDays = Math.abs(diffDays);

  if (absDiffSeconds < 60) return `${absDiffSeconds} seconds ago`;
  if (absDiffMinutes < 60) return `${absDiffMinutes} minute${absDiffMinutes !== 1 ? 's' : ''} ago`;
  if (absDiffHours < 24) return `${absDiffHours} hour${absDiffHours !== 1 ? 's' : ''} ago`;
  if (absDiffDays === 1) return 'yesterday';
  if (absDiffDays < 7) return `${absDiffDays} days ago`;
  if (absDiffDays < 30) return `${Math.round(absDiffDays / 7)} week${Math.round(absDiffDays / 7) !== 1 ? 's' : ''} ago`;
  if (absDiffDays < 365) return `${Math.round(absDiffDays / 30)} month${Math.round(absDiffDays / 30) !== 1 ? 's' : ''} ago`;
  return `${Math.round(absDiffDays / 365)} year${Math.round(absDiffDays / 365) !== 1 ? 's' : ''} ago`;
}

/**
 * Get friendly due date label for todos: "Due Today", "Due Tomorrow", "Overdue by 2 days", etc.
 * @param {Date} dueDate - The due date
 * @param {Date} [referenceDate] - The reference date (defaults to now)
 * @returns {object} Object with label and isOverdue flag
 */
function getDueDateLabel(dueDate, referenceDate = new Date()) {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const month = due.getMonth() + 1;
  const day = due.getDate();
  const dateStr = `${month}/${day}`;
  const dayName = DAY_NAMES[due.getDay()];

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `Overdue by ${overdueDays} day${overdueDays !== 1 ? 's' : ''}(${dateStr})`,
      isOverdue: true,
      daysUntil: diffDays
    };
  } else if (diffDays === 0) {
    return { label: `Due Today(${dateStr})`, isOverdue: false, daysUntil: 0 };
  } else if (diffDays === 1) {
    return { label: `Due Tomorrow(${dateStr})`, isOverdue: false, daysUntil: 1 };
  } else if (diffDays <= 6) {
    return { label: `Due ${dayName} in ${diffDays} days(${dateStr})`, isOverdue: false, daysUntil: diffDays };
  } else {
    return { label: `Due ${dateStr}`, isOverdue: false, daysUntil: diffDays };
  }
}

/**
 * Get friendly expiration label for JWTs/tokens: "Expires Today", "Expired 2 days ago", etc.
 * @param {Date} expirationDate - The expiration date
 * @param {Date} [referenceDate] - The reference date (defaults to now)
 * @returns {object} Object with label and isExpired flag
 */
function getExpirationLabel(expirationDate, referenceDate = new Date()) {
  const now = new Date(referenceDate);
  const exp = new Date(expirationDate);

  const diffMs = exp.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs > 0) {
    // Not expired yet
    if (diffSeconds < 60) return { label: `Expires in ${diffSeconds}s`, isExpired: false };
    if (diffMinutes < 60) return { label: `Expires in ${diffMinutes}m`, isExpired: false };
    if (diffHours < 24) return { label: `Expires in ${diffHours}h`, isExpired: false };
    if (diffDays === 1) return { label: 'Expires tomorrow', isExpired: false };
    return { label: `Expires in ${diffDays} days`, isExpired: false };
  } else {
    // Expired
    const absDiffSeconds = Math.abs(diffSeconds);
    const absDiffMinutes = Math.abs(diffMinutes);
    const absDiffHours = Math.abs(diffHours);
    const absDiffDays = Math.abs(diffDays);

    if (absDiffSeconds < 60) return { label: `Expired ${absDiffSeconds}s ago`, isExpired: true };
    if (absDiffMinutes < 60) return { label: `Expired ${absDiffMinutes}m ago`, isExpired: true };
    if (absDiffHours < 24) return { label: `Expired ${absDiffHours}h ago`, isExpired: true };
    if (absDiffDays === 1) return { label: 'Expired yesterday', isExpired: true };
    return { label: `Expired ${absDiffDays} days ago`, isExpired: true };
  }
}

/**
 * Format a blog/post date as "January 26, 2026"
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} Formatted date string
 */
function formatPostDate(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return null;
  }
}

/**
 * Get friendly post date with relative time: "January 26, 2026 (2 days ago)"
 * @param {string|Date} dateInput - Date string or Date object
 * @param {Date} [referenceDate] - The reference date (defaults to now)
 * @returns {object} Object with formatted date and relative time
 */
function getPostDateLabel(dateInput, referenceDate = new Date()) {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) return { formatted: null, relative: null, label: null };

  const formatted = formatPostDate(date);
  const relative = getRelativeTimeLabel(date, referenceDate);

  return {
    formatted,
    relative,
    label: `${formatted} (${relative})`
  };
}

module.exports = {
  DAY_NAMES,
  getFriendlyDateLabel,
  getDayNameAsFriendlyLabel,
  getDateAsFriendlyLabel,
  formatLastUpdated,
  getRelativeTimeLabel,
  getDueDateLabel,
  getExpirationLabel,
  formatPostDate,
  getPostDateLabel
};
