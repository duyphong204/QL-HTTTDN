export const REQUIRED_FIELDS_MESSAGE = "Vui lòng điền đầy đủ thông tin";

export const hasEmptyRequiredValue = (
  values: Array<string | null | undefined>,
): boolean => values.some((value) => !value || !value.trim());
