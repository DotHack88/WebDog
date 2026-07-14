/**
 * validation.js — Utilità di validazione input form WebDog
 */

/**
 * Valida un numero di telefono italiano (mobile o fisso).
 * Accetta formati: +39XXXXXXXXXX, 0039XXXXXXXXXX, 3XXXXXXXXX, 0XXXXXXXXX
 *
 * @param {string} phone
 * @returns {{ valid: boolean, message: string }}
 */
export function validateItalianPhone(phone) {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'Il numero di telefono è obbligatorio.' };
  }

  // Rimuove spazi, trattini, punti
  const cleaned = phone.replace(/[\s\-\.]/g, '');

  // Regex italiana: mobile (3xx) o fisso (0xx), con o senza prefisso +39/0039
  const italianMobile = /^(\+39|0039)?3\d{8,9}$/;
  const italianLandline = /^(\+39|0039)?0\d{6,10}$/;

  if (!italianMobile.test(cleaned) && !italianLandline.test(cleaned)) {
    return {
      valid: false,
      message: 'Inserisci un numero italiano valido (es. 3331234567 o +393331234567).'
    };
  }

  return { valid: true, message: '' };
}

/**
 * Valida un indirizzo email.
 * @param {string} email
 * @returns {{ valid: boolean, message: string }}
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: "L'indirizzo email è obbligatorio." };
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(email.trim())) {
    return { valid: false, message: 'Inserisci un indirizzo email valido (es. nome@dominio.it).' };
  }
  return { valid: true, message: '' };
}

/**
 * Valida che una stringa non sia vuota e abbia una lunghezza minima.
 * @param {string} value
 * @param {string} fieldName — nome del campo per il messaggio
 * @param {number} minLength — lunghezza minima (default 2)
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRequired(value, fieldName = 'Campo', minLength = 2) {
  if (!value || value.trim().length < minLength) {
    return {
      valid: false,
      message: `${fieldName} deve avere almeno ${minLength} caratteri.`
    };
  }
  return { valid: true, message: '' };
}
