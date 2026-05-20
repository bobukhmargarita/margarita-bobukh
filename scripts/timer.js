(() => {
  const TITLE_TO_START = "To the start of your winter arc:";
  const TITLE_TO_END = "To the end of your winter arc:";

  const timerSection = document.querySelector(".timer-section");

  if (!timerSection) {
    return;
  }

  const titleElement = timerSection.querySelector(".timer__title");
  const wrapper = timerSection.querySelector(".timer-wrapper");

  if (!titleElement || !wrapper) {
    return;
  }

  wrapper.innerHTML = `
    <div class="timer" role="timer" aria-live="polite" aria-atomic="true">
      <span class="timer__value" data-part="days">00</span>
      <span class="timer__separator" aria-hidden="true">:</span>
      <span class="timer__value" data-part="hours">00</span>
      <span class="timer__separator" aria-hidden="true">:</span>
      <span class="timer__value" data-part="minutes">00</span>
      <span class="timer__separator" aria-hidden="true">:</span>
      <span class="timer__value" data-part="seconds">00</span>
    </div>
    <div class="timer__labels">
      <span class="timer__label">Days</span>
      <span class="timer__label">Hours</span>
      <span class="timer__label">Minutes</span>
      <span class="timer__label">Seconds</span>
    </div>
  `;

  const daysElement = wrapper.querySelector('[data-part="days"]');
  const hoursElement = wrapper.querySelector('[data-part="hours"]');
  const minutesElement = wrapper.querySelector('[data-part="minutes"]');
  const secondsElement = wrapper.querySelector('[data-part="seconds"]');

  if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
    return;
  }

  const createDate = (year, month, day) =>
    new Date(year, month, day, 0, 0, 0, 0);

  const getTimerState = (now) => {
    const year = now.getFullYear();

    const previousWinterStart = createDate(year - 1, 11, 1);
    const currentWinterEnd = createDate(year, 2, 1);

    if (now >= previousWinterStart && now < currentWinterEnd) {
      return {
        title: TITLE_TO_END,
        target: currentWinterEnd,
      };
    }

    const currentWinterStart = createDate(year, 11, 1);
    const nextWinterEnd = createDate(year + 1, 2, 1);

    if (now >= currentWinterStart && now < nextWinterEnd) {
      return {
        title: TITLE_TO_END,
        target: nextWinterEnd,
      };
    }

    return {
      title: TITLE_TO_START,
      target:
        now < currentWinterStart
          ? currentWinterStart
          : createDate(year + 1, 11, 1),
    };
  };

  const formatValue = (value) => String(value).padStart(2, "0");

  const getCountdownParts = (targetTime, nowTime) => {
    const totalSeconds = Math.max(0, Math.floor((targetTime - nowTime) / 1000));

    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  const updateValues = ({ days, hours, minutes, seconds }) => {
    daysElement.textContent = formatValue(days);
    hoursElement.textContent = formatValue(hours);
    minutesElement.textContent = formatValue(minutes);
    secondsElement.textContent = formatValue(seconds);
  };

  const updateTimer = () => {
    const now = new Date();
    const state = getTimerState(now);

    titleElement.textContent = state.title;

    const parts = getCountdownParts(state.target.getTime(), now.getTime());
    updateValues(parts);
  };

  updateTimer();
  window.setInterval(updateTimer, 1000);
})();
