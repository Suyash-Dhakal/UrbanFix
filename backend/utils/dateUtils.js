import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek.js';

dayjs.extend(isoWeek);

export const getDateRange = (range) => {
  let from, to;

  const now = dayjs();

  switch(range) {
    case 'last-week':
      // Last full ISO week (Monday to Sunday)
      from = now.subtract(1, 'week').startOf('isoWeek');
      to = now.subtract(1, 'week').endOf('isoWeek');
      break;

    case 'last-month':
      // Last full calendar month
      from = now.subtract(1, 'month').startOf('month');
      to = now.subtract(1, 'month').endOf('month');
      break;

    case 'last-year':
      // Last full calendar year
      from = now.subtract(1, 'year').startOf('year');
      to = now.subtract(1, 'year').endOf('year');
      break;

    default:
      // fallback to last 7 days from today
      from = now.subtract(7, 'day');
      to = now;
  }

  return {
    from: from.toDate(),
    to: to.toDate()
  };
};
