export function useAddressSuggestions(query: string) {
  const addresses = [
    "Chmielna 11",
    "Elektryczna 11",
    "Świętokrzyska 31",
    "Marszałkowska 20",
    "Nowy Świat 5",
  ];
  return addresses.filter((address) =>
    address.toLowerCase().includes(query.toLowerCase())
  );
}
