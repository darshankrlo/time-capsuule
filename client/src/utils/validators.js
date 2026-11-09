export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return "";
};

export const validateName = (name) => {
  if (!name.trim()) return "Name is required";
  if (name.trim().length > 100) return "Name is too long";
  return "";
};