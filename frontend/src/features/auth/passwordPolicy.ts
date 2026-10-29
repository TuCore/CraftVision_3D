export function getPasswordRequirements(password: string) {
  return [
    { id: "length", label: "Ít nhất 8 ký tự", met: Array.from(password).length >= 8 },
    { id: "uppercase", label: "Ít nhất 1 chữ hoa", met: /\p{Lu}/u.test(password) },
    { id: "lowercase", label: "Ít nhất 1 chữ thường", met: /\p{Ll}/u.test(password) },
    { id: "number", label: "Ít nhất 1 số", met: /\p{Nd}/u.test(password) },
    { id: "special", label: "Ít nhất 1 ký tự đặc biệt (ví dụ: !, @, #)", met: /[\p{P}\p{S}]/u.test(password) },
  ];
}

export function isStrongPassword(password: string) {
  return getPasswordRequirements(password).every((requirement) => requirement.met);
}
