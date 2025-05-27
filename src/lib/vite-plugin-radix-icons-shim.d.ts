// Type declaration for radixIconsShim
export function radixIconsShim(): {
  name: string;
  enforce: "pre" | "post" | undefined;
  transform(code: string, id: string): string | null | undefined;
};
