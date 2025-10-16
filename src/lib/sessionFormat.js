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
  const c = session.condition;
  const hasTemp = t !== undefined && t !== null && t !== '';
  const hasCond = !!c;
  if (hasTemp && hasCond) return `${t}°C, ${c}`;
  if (hasTemp) return `${t}°C`;
  if (hasCond) return c;
  return '-';
}
