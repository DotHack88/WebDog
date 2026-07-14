/**
 * useRateLimit — hook per proteggere i form da invii multipli (anti-spam)
 *
 * Salva i timestamp degli invii in localStorage e blocca ulteriori invii
 * se vengono superati i limiti configurati.
 *
 * @param {string} key       — chiave univoca per il form (es. 'booking', 'contact')
 * @param {object} options
 *   @param {number} maxPerWindow  — numero massimo di invii consentiti nel periodo (default: 3)
 *   @param {number} windowMs      — durata del periodo in ms (default: 15 minuti)
 *   @param {number} cooldownMs    — blocco aggiuntivo dopo l'ultimo invio (default: 60 secondi)
 *
 * @returns {{ canSubmit, recordSubmit, remainingSeconds, attemptsLeft }}
 */

import { useState, useEffect, useCallback } from 'react';

const LS_PREFIX = 'webdog_rl_';

export function useRateLimit(key, {
  maxPerWindow = 3,
  windowMs     = 15 * 60 * 1000,  // 15 minuti
  cooldownMs   = 60 * 1000,        // 60 secondi dopo ogni invio
} = {}) {
  const storageKey = LS_PREFIX + key;

  // Legge i timestamp dal localStorage
  const readTimestamps = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Filtra i timestamp ancora validi nella finestra temporale
  const getValidTimestamps = () => {
    const now = Date.now();
    return readTimestamps().filter(ts => now - ts < windowMs);
  };

  const [timestamps, setTimestamps] = useState(getValidTimestamps);
  const [, tick] = useState(0); // forza re-render ogni secondo durante il cooldown

  // Conta quanti secondi mancano alla fine del cooldown
  const getRemainingSeconds = () => {
    const valid = getValidTimestamps();
    if (valid.length === 0) return 0;
    const last = valid[valid.length - 1];
    const elapsed = Date.now() - last;
    if (elapsed >= cooldownMs) return 0;
    return Math.ceil((cooldownMs - elapsed) / 1000);
  };

  const [remainingSeconds, setRemainingSeconds] = useState(getRemainingSeconds);

  // Aggiorna il countdown ogni secondo finché c'è un cooldown attivo
  useEffect(() => {
    const remaining = getRemainingSeconds();
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      const r = getRemainingSeconds();
      setRemainingSeconds(r);
      tick(n => n + 1);
      if (r <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamps]);

  // Verifica se l'utente può inviare
  const valid         = getValidTimestamps();
  const attemptsLeft  = Math.max(0, maxPerWindow - valid.length);
  const inCooldown    = getRemainingSeconds() > 0;
  const canSubmit     = attemptsLeft > 0 && !inCooldown;

  // Da chiamare al momento dell'invio (dopo la validazione del form)
  const recordSubmit = useCallback(() => {
    const now = Date.now();
    const updated = [...getValidTimestamps(), now];
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch { /* quota exceeded — non critico */ }
    setTimestamps(updated);
    setRemainingSeconds(Math.ceil(cooldownMs / 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, cooldownMs]);

  return {
    canSubmit,
    recordSubmit,
    remainingSeconds: getRemainingSeconds(),
    attemptsLeft,
  };
}
