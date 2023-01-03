export function createLog(name: string) {
  return (message: string) => {
    console.log(`[${name}]: ${message}`);
  };
}
