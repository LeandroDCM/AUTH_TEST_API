export default function validPassword(
  password: string,
  confirmPassword: string
) {
  if (password !== confirmPassword) {
    return "Passwords don't match";
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return "Password needs atleast one uppercase letter.";
  }

  if (!/(?=.*\d)/.test(password)) {
    return "Password needs atleast one number.";
  }

  if (!/(?=.*\W)/.test(password)) {
    return "Password needs atleast one special character.";
  }
}
