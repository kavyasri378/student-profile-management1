import { useState, useEffect } from 'react';

// Custom hook for localStorage operations
export const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Remove item from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Custom hook for form validation
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle input changes
  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  // Validate individual field
  const validateField = (name, value) => {
    if (!validationRules[name]) return;
    
    const rule = validationRules[name];
    let error = '';

    if (rule.required && (!value || value.toString().trim() === '')) {
      error = rule.requiredMessage || `${name} is required`;
    } else if (rule.pattern && !rule.pattern.test(value)) {
      error = rule.message || `Invalid ${name} format`;
    } else if (rule.minLength && value.length < rule.minLength) {
      error = `${name} must be at least ${rule.minLength} characters`;
    } else if (rule.custom && rule.custom(value)) {
      error = rule.customMessage || `Invalid ${name}`;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateAll = () => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Reset form
  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setValues
  };
};
