// years.ts
export type YearOption = {
  value: string;
  label: string;
};

const years: YearOption[] = Array.from({ length: 24 }, (_, i) => {
  const yearAD = new Date().getFullYear() - i; // ค.ศ.
  const yearBE = yearAD + 543; // แปลงเป็น พ.ศ.
  return { value: yearBE.toString(), label: yearBE.toString() };
});

export default years;
