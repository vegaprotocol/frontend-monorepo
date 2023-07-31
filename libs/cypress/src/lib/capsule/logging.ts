export function createLog(name: string) {
  return (message: string) => {
    // eslint-disable-next-line no-console
    console.log(`[${name}]: ${message}`);
  };
}
