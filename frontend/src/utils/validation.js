// Validaciones
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePasswordStrength = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  const isLengthValid = password.length >= 8;

  const strength =
    (hasUpperCase ? 1 : 0) +
    (hasLowerCase ? 1 : 0) +
    (hasNumbers ? 1 : 0) +
    (hasSpecialChar ? 1 : 0) +
    (isLengthValid ? 1 : 0);

  return {
    score: strength,
    isValid: strength >= 3,
    feedback: {
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLengthValid,
    },
  };
};

export const validatePhoneNumber = (phone) => {
  const regex = /^[0-9\s\-\+\(\)]+$/;
  return regex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

export const getErrorMessage = (error, language = 'ES') => {
  if (typeof error === 'string') return error;

  if (error.error) {
    if (language === 'ES') {
      const messages = {
        'Email ya existe': 'El email ya está registrado',
        'Credenciales incorrectas': 'Email o contraseña incorrectos',
        'Token no proporcionado': 'Debes autenticarte primero',
        'Token inválido': 'Tu sesión ha expirado',
        'Usuario no encontrado': 'Usuario no existe',
      };
      return messages[error.error] || error.error;
    }
    return error.error;
  }

  return language === 'ES' ? 'Error en la solicitud' : 'Request error';
};
