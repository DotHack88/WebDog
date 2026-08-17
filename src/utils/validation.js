/**
 * validation.js — Utilità di validazione input form WebDog
 */

/**
 * Valida un numero di telefono (mobile o fisso).
 * Accetta prefissi internazionali.
 *
 * @param {string} phone
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'Il numero di telefono è obbligatorio.' };
  }

  // Rimuove spazi, trattini, punti
  const cleaned = phone.replace(/[\s\-\.]/g, '');

  // Almeno 8 cifre, opzionalmente un + all'inizio
  const internationalPhone = /^\+?\d{8,15}$/;

  if (!internationalPhone.test(cleaned)) {
    return {
      valid: false,
      message: 'Inserisci un numero di telefono valido.'
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
