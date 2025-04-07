export const startOfUtcDay = () => {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
    ),
  );
};

export const endOfUtcDay = () => {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
};

export function getSubscriptionEndDate(days: number): Date {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  return currentDate;
}

export function getNewSubscriptionEndTimestamp(existingEndDate: number, daysToAdd: number): Date {
  const currentDate = new Date();
  let endDate = new Date(existingEndDate); // Дата окончания текущей подписки

  // Если дата окончания подписки ещё не прошла, добавляем дни к текущей дате
  if (endDate > currentDate) {
      endDate.setDate(endDate.getDate() + daysToAdd); // Добавляем 30 дней
  } else {
      endDate = currentDate; // Если подписка уже закончилась, начинаем с текущей даты
      endDate.setDate(endDate.getDate() + daysToAdd); // Добавляем 30 дней
  }

  return endDate; // Возвращаем новый timestamp
}

export function getCurrentTimestamp(): number {
  const currentDate = new Date();
  return Number((currentDate.getTime() / 1000).toFixed(0))
}
