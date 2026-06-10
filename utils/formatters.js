const indianNumberFormat = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatIndianPhone(phone) {
  if (!phone || typeof phone !== "string") return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91 ${digits.slice(1, 6)} ${digits.slice(6)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  return phone;
}

function formatIndianCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return value;
  return `Rs. ${indianNumberFormat.format(Number(value))}`;
}

function formatDocument(doc) {
  if (!doc || typeof doc !== "object") return doc;
  const data = doc.toObject ? doc.toObject() : { ...doc };

  if (typeof data.phone === "string") data.phone = formatIndianPhone(data.phone);
  if (typeof data.amount === "number") data.amountINR = formatIndianCurrency(data.amount);
  if (typeof data.price === "number") data.priceINR = formatIndianCurrency(data.price);

  return data;
}

function formatResponse(value) {
  if (Array.isArray(value)) return value.map(formatDocument);
  return formatDocument(value);
}

module.exports = { formatResponse, formatIndianCurrency };
