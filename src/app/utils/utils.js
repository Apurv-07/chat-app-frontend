export function formatCustomDate(dateString) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 || 12;

  const ordinalSuffix = (n) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${ordinalSuffix(day)} ${month}, ${formattedHour}:${minutes} ${ampm}`;
}
