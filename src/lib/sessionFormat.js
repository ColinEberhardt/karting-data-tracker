export function formatDateTime(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatFastestLap(time) {
  if (!time) return '-';
  return `${Number(time).toFixed(2)}`;
}

export function formatTyrePressures(session) {
  const { frontOuter, frontInner, rearOuter, rearInner } = session;
  if (
    frontOuter == null ||
    frontInner == null ||
    rearOuter == null ||
    rearInner == null
  ) {
    return '-';
  }
  if (
    frontOuter === frontInner &&
    frontInner === rearOuter &&
    rearOuter === rearInner
  ) {
    return `${frontOuter} psi`;
  }
  if (
    frontOuter === frontInner &&
    rearOuter === rearInner &&
    frontOuter !== rearOuter
  ) {
    return `f ${frontOuter} / r ${rearOuter} psi`;
  }
  return `fo ${frontOuter} / fi ${frontInner} / ro ${rearOuter} / ri ${rearInner} psi`;
}

export function formatGearing(session) {
  const { frontSprocket, rearSprocket } = session;
  const f = Number(frontSprocket);
  const r = Number(rearSprocket);
  if (!f || !r) return '-';
  const ratio = (r / f).toFixed(2).replace(/\.00$/, '');
  return `${f}/${r} (${ratio})`;
}

export function formatWeather(session) {
  const t = session.temp;
  const hasTemp = t !== undefined && t !== null && t !== '';
  if (hasTemp) return `${t}`;
  return '-';
}

// WMO Weather interpretation codes mapping
export const weatherCodeDescriptions = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

// Get all available weather codes as options for dropdowns
export function getWeatherCodeOptions() {
  return Object.entries(weatherCodeDescriptions).map(([code, description]) => ({
    code: parseInt(code),
    description
  }));
}

// Get weather description from code
export function getWeatherDescription(code) {
  if (code === null || code === undefined) return 'Not recorded';
  return weatherCodeDescriptions[code] || `Weather code: ${code}`;
}

// Get weather emoji from code
export function weatherCodeEmoji(code) {
  if (code === null || code === undefined) return '❓';
  
  // Clear sky conditions
  if (code === 0) return '☀️';
  if (code === 1) return '🌤️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  
  // Fog
  if (code === 45 || code === 48) return '🌫️';
  
  // Drizzle
  if (code >= 51 && code <= 57) return '🌦️';
  
  // Rain
  if (code === 61) return '🌧️';
  if (code === 63) return '🌧️';
  if (code === 65) return '🌧️';
  if (code === 66 || code === 67) return '🌧️';
  
  // Snow
  if (code >= 71 && code <= 77) return '❄️';
  
  // Rain showers
  if (code >= 80 && code <= 82) return '🌧️';
  
  // Snow showers
  if (code === 85 || code === 86) return '🌨️';
  
  // Thunderstorm
  if (code >= 95 && code <= 99) return '⛈️';
  
  return '🌤️'; // Default
}
