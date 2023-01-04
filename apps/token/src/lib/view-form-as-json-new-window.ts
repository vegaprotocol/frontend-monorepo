export const viewJsonStringInNewWindow = (jsonString: string) => {
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  window.open(url);
};
