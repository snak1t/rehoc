export class FormNestedGroup {
  constructor(object) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        this[key] = object[key];
        const element = object[key];
      }
    }
  }
}
export const nested = obj => new FormNestedGroup(obj);
