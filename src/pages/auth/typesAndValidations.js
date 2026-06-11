import * as Yup from 'yup';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// --- Sign In ---

export const signInInitialValues = {
  email: '',
  password: '',
};

export const signInValidationSchema = Yup.object({
  email: Yup.string()
    .matches(emailRegex, 'Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});


// --- Sign Up ---

export const signUpInitialValues = {
  displayName: '',
  email: '',
  company: '',
  designation: '',
  countryCode: '',
  city: '',
  password: '',
};

export const signUpValidationSchema = Yup.object({
  displayName: Yup.string()
    .min(2, 'Display name must be at least 2 characters')
    .required('Display name is required'),
  email: Yup.string()
    .matches(emailRegex, 'Invalid email address')
    .required('Email is required'),
  company: Yup.string(),
  designation: Yup.string(),
  countryCode: Yup.string()
    .required('Country is required'),
  city: Yup.string()
    .required('City is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});
