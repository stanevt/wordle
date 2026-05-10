export function evaluateGuess(guess, answer) {
  const result = Array(5).fill('absent');
  const answerPool = answer.split('');

  // Pass 1: exact matches
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      answerPool[i] = null;
    }
  }

  // Pass 2: present (consume from remaining pool)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue;
    const j = answerPool.indexOf(guess[i]);
    if (j !== -1) {
      result[i] = 'present';
      answerPool[j] = null;
    }
  }

  return result;
}
