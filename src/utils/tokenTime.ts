function createTokenTime(input: string) {
  const timeValue: number = parseInt(input.slice(0, -1));
  const timeUnit: string = input.slice(-1);

  let multiplier: number;
  switch (timeUnit) {
    case 'm':
      multiplier = 60;
      break;
    case 'h':
      multiplier = 3600;
      break;
    case 'd':
      multiplier = 86400;
      break;
    default:
      throw new Error('Invalid time unit');
  }

  return {
    string: input,
    number: timeValue * multiplier * 1000,
  };
}

const tokenTime = createTokenTime('1d');
export default tokenTime;
