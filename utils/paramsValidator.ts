export default function hasErrors(fields: string[], target: any) {
  const errors: string[] = [];

  fields.forEach((field) => {
    if (!target[field]) errors.push(field);
  });
  return errors;
}
