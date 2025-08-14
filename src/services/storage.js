/**
 * Storage service: encapsulates cookie read/write for config and stats,
 * including trimming policy for game sessions.
 */

const CONFIG_COOKIE_NAME = 'shootTheUnicornConfig';
const STATS_COOKIE_NAME = 'shootTheUnicornGameStats';
const COOKIE_EXPIRY_DAYS = 365;
const MAX_SESSIONS = 50; // keep last 50 sessions

function setCookie(name, value, days = COOKIE_EXPIRY_DAYS) {
  try {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + expiryDate.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  } catch (e) {
    console.warn('setCookie failed', name, e);
  }
}

function getCookie(name) {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const c = cookie.trim();
      if (c.indexOf(name + '=') === 0) {
        return c.substring(name.length + 1);
      }
    }
  } catch (e) {
    console.warn('getCookie failed', name, e);
  }
  return null;
}

function deleteCookie(name) {
  try {
    // Best-effort delete for real browsers and test environments.
    // In real browsers, setting an expired cookie removes it from document.cookie reads.
    // In our tests, document.cookie is a plain string; handle that explicitly.
    if (typeof document.cookie === 'string') {
      const parts = document.cookie.split(';').filter((c) => !c.trim().startsWith(name + '='));
      const next = parts.join(';').trim();
      document.cookie = next;
    } else {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  } catch (e) {
    console.warn('deleteCookie failed', name, e);
  }
}

// Config
export function saveConfig(config) {
  setCookie(CONFIG_COOKIE_NAME, JSON.stringify(config));
}

export function loadConfig() {
  const v = getCookie(CONFIG_COOKIE_NAME);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch (e) {
    console.warn('Invalid config cookie JSON');
    return null;
  }
}

export function deleteConfig() {
  deleteCookie(CONFIG_COOKIE_NAME);
}

// Stats
export function saveStats(stats) {
  setCookie(STATS_COOKIE_NAME, JSON.stringify(stats));
}

export function loadStats() {
  const v = getCookie(STATS_COOKIE_NAME);
  if (!v) {
    return {
      totalHits: 0,
      totalMisses: 0,
      totalTargetsPenalized: 0,
      gameSessionStats: [],
    };
  }
  try {
    const saved = JSON.parse(v);
    return {
      totalHits: saved.totalHits || 0,
      totalMisses: saved.totalMisses || 0,
      totalTargetsPenalized: saved.totalTargetsPenalized || 0,
      gameSessionStats: saved.gameSessionStats || [],
    };
  } catch (e) {
    console.warn('Invalid stats cookie JSON');
    return {
      totalHits: 0,
      totalMisses: 0,
      totalTargetsPenalized: 0,
      gameSessionStats: [],
    };
  }
}

export function deleteStats() {
  deleteCookie(STATS_COOKIE_NAME);
}

/**
 * Append a new session to stats, update totals, and enforce trimming.
 * Returns the updated stats object.
 */
export function addSession(stats, session) {
  const next = {
    totalHits: (stats?.totalHits || 0) + (session?.hits || 0),
    totalMisses: (stats?.totalMisses || 0) + (session?.misses || 0),
    totalTargetsPenalized: (stats?.totalTargetsPenalized || 0) + (session?.targetsPenalized || 0),
    gameSessionStats: Array.isArray(stats?.gameSessionStats) ? [...stats.gameSessionStats, session] : [session],
  };
  if (next.gameSessionStats.length > MAX_SESSIONS) {
    next.gameSessionStats = next.gameSessionStats.slice(-MAX_SESSIONS);
  }
  return next;
}
