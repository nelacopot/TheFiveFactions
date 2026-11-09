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

export function validateRegistration(values: RegistrationValues) {
  const fieldErrors: Partial<Record<RegistrationField, string>> = {};
  const email = values.email.trim();
  const username = values.username.trim();
  const password = values.password;

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    fieldErrors.email = "Vnesi veljaven e-poštni naslov.";
  }
  if (username.length < 3 || username.length > 30 || !usernamePattern.test(username)) {
    fieldErrors.username = "Uporabniško ime naj vsebuje 3–30 črk, številk ali podčrtajev.";
  }
  if (password.length < 8 || password.length > 20) {
    fieldErrors.password = "Geslo mora biti dolgo od 8 do 20 znakov.";
  } else if (!/[A-Z]/.test(password)) {
    fieldErrors.password = "Geslo mora vsebovati vsaj eno veliko črko.";
  } else if (!/[a-z]/.test(password)) {
    fieldErrors.password = "Geslo mora vsebovati vsaj eno malo črko.";
  } else if (!/[0-9]/.test(password)) {
    fieldErrors.password = "Geslo mora vsebovati vsaj eno številko.";
  } else if (![...specialCharacters].some((character) => password.includes(character))) {
    fieldErrors.password = "Geslo mora vsebovati vsaj en posebni znak s seznama v pravilih.";
  }

  return {
    values: { email: email.toLowerCase(), username, password },
    fieldErrors,
  };
}
