export default function hasErrors(fields: string[], target: any) {
  //new array to hold the name of empty fields.
  const errors: string[] = [];

  //check if each field of the object req.body/target exists.
  //if the field object[field] does not exist. push the string representing it
  //to the array errors
  fields.forEach((field) => {
    if (!target[field]) errors.push(field);
  });
  //return array errors
  return errors;
}
