/**
 * Service: Player management and per-player storage (localStorage)
 */

const KEY_PLAYERS = 'popzy:players';
const KEY_CURRENT = 'popzy:currentPlayer';
const CFG_PREFIX = 'popzy:cfg:';
const STATS_PREFIX = 'popzy:stats:';

function lsGet(key, fallback = null) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); return true; } catch { return false; }
}
function lsDel(key) { try { localStorage.removeItem(key); } catch {}
}

function nowISO() { try { return new Date().toISOString(); } catch { return '';} }

export function listPlayers() {
  return lsGet(KEY_PLAYERS, []);
}

export function getCurrentPlayerId() {
  try { return localStorage.getItem(KEY_CURRENT) || null; } catch { return null; }
}

export function setCurrentPlayer(id) {
  try { localStorage.setItem(KEY_CURRENT, id || ''); } catch {}
  const players = listPlayers();
  const p = players.find(p => p.id === id);
  if (p) { p.lastSeen = nowISO(); lsSet(KEY_PLAYERS, players); }
}

function validateName(name) {
  const trimmed = (name || '').trim();
  if (trimmed.length < 1 || trimmed.length > 20) return { ok: false, reason: 'length' };
  if (!/^[A-Za-z0-9]+$/.test(trimmed)) return { ok: false, reason: 'chars' };
  return { ok: true, name: trimmed };
}

function nameExists(name, excludeId = null) {
  const n = (name || '').toLowerCase();
  return listPlayers().some(p => p.name.toLowerCase() === n && p.id !== excludeId);
}

function genId(name) {
  const base = (name || 'p').toLowerCase();
  const rand = Math.random().toString(36).slice(2, 6);
  return `${base}-${rand}`;
}

export function createPlayer(name) {
  const v = validateName(name);
  if (!v.ok) return { ok: false, error: v.reason };
  if (nameExists(v.name)) return { ok: false, error: 'duplicate' };
  const players = listPlayers();
  const id = genId(v.name);
  const p = { id, name: v.name, createdAt: nowISO(), lastSeen: nowISO() };
  players.push(p);
  if (!lsSet(KEY_PLAYERS, players)) return { ok: false, error: 'storage' };
  // initialize empty cfg/stats
  lsSet(CFG_PREFIX + id, {});
  lsSet(STATS_PREFIX + id, { totals: { hits:0, misses:0, targetsPenalized:0, timeSeconds:0, sessionsCount:0 }, sessions: [] });
  setCurrentPlayer(id);
  return { ok: true, player: p };
}

export function renamePlayer(id, nextName) {
  const v = validateName(nextName);
  if (!v.ok) return { ok: false, error: v.reason };
  if (nameExists(v.name, id)) return { ok: false, error: 'duplicate' };
  const players = listPlayers();
  const p = players.find(p => p.id === id);
  if (!p) return { ok: false, error: 'not_found' };
  p.name = v.name; lsSet(KEY_PLAYERS, players); return { ok: true, player: p };
}

export function deletePlayer(id) {
  const players = listPlayers().filter(p => p.id !== id);
  lsSet(KEY_PLAYERS, players);
  lsDel(CFG_PREFIX + id);
  lsDel(STATS_PREFIX + id);
  const cur = getCurrentPlayerId();
  if (cur === id) { try { localStorage.removeItem(KEY_CURRENT); } catch {} }
  return { ok: true };
}

export function loadPlayerConfig(id) {
  return lsGet(CFG_PREFIX + id, {});
}

export function savePlayerConfig(id, cfg) {
  return lsSet(CFG_PREFIX + id, cfg || {});
}

export function loadPlayerStats(id) {
  const s = lsGet(STATS_PREFIX + id, null);
  if (!s) return { totals: { hits:0, misses:0, targetsPenalized:0, timeSeconds:0, sessionsCount:0 }, sessions: [] };
  return s;
}

export function savePlayerStats(id, stats) {
  return lsSet(STATS_PREFIX + id, stats);
}

export function addPlayerSession(id, session) {
  const stats = loadPlayerStats(id);
  const next = { ...stats };
  next.totals = {
    hits: (stats.totals?.hits || 0) + (session?.hits || 0),
    misses: (stats.totals?.misses || 0) + (session?.misses || 0),
    targetsPenalized: (stats.totals?.targetsPenalized || 0) + (session?.targetsPenalized || 0),
    timeSeconds: (stats.totals?.timeSeconds || 0) + (session?.gameDurationSeconds || 0),
    sessionsCount: (stats.totals?.sessionsCount || 0) + 1,
  };
  next.sessions = Array.isArray(stats.sessions) ? [...stats.sessions, session] : [session];
  if (next.sessions.length > 10) next.sessions = next.sessions.slice(-10);
  savePlayerStats(id, next);
  return next;
}

export function computeAggregates(stats) {
  const sessions = stats?.sessions || [];
  const n = sessions.length || 0;
  const totalScore = sessions.reduce((s,g)=>s+(g.score||0),0);
  const totalRate = sessions.reduce((s,g)=>s+(g.averageHitRate||0),0);
  const totalAcc = sessions.reduce((s,g)=>s+(g.accuracy||0),0);
  const totalTime = stats?.totals?.timeSeconds || sessions.reduce((s,g)=>s+(g.gameDurationSeconds||0),0);
  const modeEnd = (()=>{
    const m={}; sessions.forEach(g=>{const r=g.gameEndReason||'unknown'; m[r]=(m[r]||0)+1;});
    let max=0,key='unknown'; for (const [k,v] of Object.entries(m)) { if (v>max) { max=v; key=k; } }
    return key;
  })();
  return {
    averageScore: n? totalScore/n : 0,
    averageRate: n? totalRate/n : 0,
    averageAccuracy: n? totalAcc/n : 0,
    averagePlayTimeSec: n? totalTime/n : 0,
    totalPlayTimeSec: totalTime,
    modeEndReason: modeEnd,
    sessionsCount: stats?.totals?.sessionsCount || n,
  };
}
