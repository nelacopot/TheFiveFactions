export type RegistrationField = "email" | "username" | "password";

export type RegistrationActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: Partial<Record<RegistrationField, string>>;
};

export type RegistrationValues = {
  email: string;
  username: string;
  password: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[A-Za-z0-9_]+$/;
const specialCharacters = "~!@#$^*_{}|:?`-=[];’,./";

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email || email.length > 254 || !emailPattern.test(email)) {
    return "Vnesi veljaven e-poštni naslov.";
  }
  return undefined;
}

export function validateUsername(value: string): string | undefined {
  const username = value.trim();
  if (username.length < 3 || username.length > 30 || !usernamePattern.test(username)) {
    return "Uporabniško ime naj vsebuje 3–30 črk, številk ali podčrtajev.";
  }
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8 || password.length > 20) {
    return "Geslo mora biti dolgo od 8 do 20 znakov.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Geslo mora vsebovati vsaj eno veliko črko.";
  }
  if (!/[a-z]/.test(password)) {
    return "Geslo mora vsebovati vsaj eno malo črko.";
  }
  if (!/[0-9]/.test(password)) {
    return "Geslo mora vsebovati vsaj eno številko.";
  }
  if (![...specialCharacters].some((character) => password.includes(character))) {
    return "Geslo mora vsebovati vsaj en posebni znak s seznama v pravilih.";
  }
  return undefined;
}

export function validateRegistration(values: RegistrationValues) {
  const fieldErrors: Partial<Record<RegistrationField, string>> = {};
  const email = values.email.trim();
  const username = values.username.trim();
  const password = values.password;

  fieldErrors.email = validateEmail(email);
  fieldErrors.username = validateUsername(username);
  fieldErrors.password = validatePassword(password);

  for (const key of Object.keys(fieldErrors) as RegistrationField[]) {
    if (fieldErrors[key] === undefined) delete fieldErrors[key];
  }

  return {
    values: { email: email.toLowerCase(), username, password },
    fieldErrors,
  };
}
