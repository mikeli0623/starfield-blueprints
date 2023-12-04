export function formatNumberWithCommas(number: number): string {
  return !Number.isNaN(number)
    ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : "0";
}
