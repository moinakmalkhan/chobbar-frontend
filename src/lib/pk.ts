/** Pakistan address helpers: common cities (for autocomplete) with their province, and phone normalisation. */
export const PK_CITIES: Record<string, string> = {
  Lahore: "Punjab",
  Karachi: "Sindh",
  Islamabad: "Islamabad Capital Territory",
  Rawalpindi: "Punjab",
  Faisalabad: "Punjab",
  Multan: "Punjab",
  Sialkot: "Punjab",
  Gujranwala: "Punjab",
  Gujrat: "Punjab",
  Sargodha: "Punjab",
  Bahawalpur: "Punjab",
  Sahiwal: "Punjab",
  Sheikhupura: "Punjab",
  Jhelum: "Punjab",
  Kasur: "Punjab",
  Okara: "Punjab",
  "Rahim Yar Khan": "Punjab",
  "Dera Ghazi Khan": "Punjab",
  Peshawar: "Khyber Pakhtunkhwa",
  Mardan: "Khyber Pakhtunkhwa",
  Abbottabad: "Khyber Pakhtunkhwa",
  Swat: "Khyber Pakhtunkhwa",
  Hyderabad: "Sindh",
  Sukkur: "Sindh",
  Larkana: "Sindh",
  Quetta: "Balochistan",
  Gwadar: "Balochistan",
  Gilgit: "Gilgit-Baltistan",
  Skardu: "Gilgit-Baltistan",
  Muzaffarabad: "Azad Kashmir",
  Mirpur: "Azad Kashmir",
};

export const PK_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Gilgit-Baltistan",
  "Azad Kashmir",
];

export function provinceForCity(city: string) {
  const hit = Object.keys(PK_CITIES).find((c) => c.toLowerCase() === city.trim().toLowerCase());
  return hit ? PK_CITIES[hit] : undefined;
}

/** Accepts 03001234567, 0300-1234567, +92 300 1234567, 923001234567. */
export function isValidPkPhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  return /^(\+92|0092|92|0)?3\d{9}$/.test(digits) || digits.replace(/\D/g, "").length >= 10;
}
