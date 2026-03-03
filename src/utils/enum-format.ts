export const formatEnumValue = (value: string | undefined, enumType: any) => {
  if (!value) return "";
  return enumType[value] || value;
};
