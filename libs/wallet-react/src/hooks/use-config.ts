export function useConfig() {
  const context = useContext(VegaWalletContext);
  if (context === undefined) {
    throw new Error('must be used within VegaWalletProvider');
  }
  return context;
}
