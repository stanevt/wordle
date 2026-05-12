import { useState, useMemo, useEffect, useRef } from 'react';
import './App.css';

function MobilePrevDay({ prevAnswer }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="mobile-prev-day">
      <span className="mobile-prev-label">Yesterday's word</span>
      <button
        className={`mobile-prev-word${revealed ? ' mobile-prev-word--revealed' : ''}`}
        onClick={() => setRevealed(r => !r)}
      >
        {revealed ? prevAnswer : '?????'}
      </button>
    </div>
  );
}
import Header from './components/Header';
import Board from './components/Board/Board';
import Keyboard from './components/Keyboard/Keyboard';
import Calendar from './components/Calendar/Calendar';
import StatsModal from './components/StatsModal/StatsModal';
import AuthModal from './components/AuthModal/AuthModal';
import EasterEgg from './components/EasterEgg';
import Toast from './components/Toast';
import { useWordList } from './hooks/useWordList';
import { useDailyWord } from './hooks/useDailyWord';
import { useGame } from './hooks/useGame';
import { useStats } from './hooks/useStats';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { syncFromRemote } from './lib/gameSync';
import { todayISO, previousDay } from './utils/dateUtils';
import { getAllGameStates } from './utils/storage';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [showStats, setShowStats] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [statsKey, setStatsKey] = useState(0);
  const [gameKey, setGameKey] = useState(0);

  const { user, username, signIn, signUp, signOut } = useAuth();
  const { light, toggleTheme } = useTheme();
  const prevUserId = useRef(null);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (userId && userId !== prevUserId.current) {
      prevUserId.current = userId;
      syncFromRemote(userId)
        .then(() => setStatsKey(k => k + 1))
        .catch(() => {})
        .finally(() => setGameKey(k => k + 1));
    } else if (!userId && prevUserId.current !== null) {
      prevUserId.current = null;
      setStatsKey(k => k + 1);
      setGameKey(k => k + 1);
    }
  }, [user]);

  const { isValidWord } = useWordList();
  const { answer } = useDailyWord(selectedDate);
  const { answer: prevAnswer } = useDailyWord(previousDay(selectedDate));

  const game = useGame({ answer, dateStr: selectedDate, isValidWord, userId: user?.id, username, resetKey: gameKey });

  const [lastKnownStatus, setLastKnownStatus] = useState(game.status);
  if (game.status !== lastKnownStatus) {
    setLastKnownStatus(game.status);
    if (game.status === 'won' || game.status === 'lost') {
      setStatsKey(k => k + 1);
    }
  }

  const stats = useStats(statsKey, user?.id);

  const completedDates = useMemo(() => {
    const all = getAllGameStates(user?.id);
    const result = {};
    for (const [date, state] of Object.entries(all)) {
      if (state.status === 'won' || state.status === 'lost') {
        result[date] = state.status;
      }
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsKey, user?.id]);

  function handleDateSelect(date) {
    setSelectedDate(date);
    setShowCalendar(false);
    setStatsKey(k => k + 1);
  }

  return (
    <div className="app">
      <Header
        onStatsClick={() => setShowStats(true)}
        onCalendarClick={() => setShowCalendar(v => !v)}
        onAuthClick={() => setShowAuth(true)}
        onSignOut={signOut}
        onToggleTheme={toggleTheme}
        lightMode={light}
        username={username}
        prevAnswer={prevAnswer}
        selectedDate={selectedDate}
      />

      <main className="main">
        <section className="game-area">
          <div className="board-wrapper">
            <Toast message={game.toastMessage} />
            <Board
              guesses={game.guesses}
              evaluations={game.evaluations}
              currentInput={game.currentInput}
              revealingRow={game.revealingRow}
              shakingRow={game.shakingRow}
            />
          </div>
          <Keyboard onKey={game.handleKey} letterStatuses={game.letterStatuses} />
        </section>

        <aside className="sidebar">
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            completedDates={completedDates}
          />
        </aside>
      </main>

      {/* Mobile calendar modal */}
      {showCalendar && (
        <div className="mobile-cal-backdrop" onClick={() => setShowCalendar(false)}>
          <div className="mobile-cal-sheet" onClick={e => e.stopPropagation()}>
            {prevAnswer && <MobilePrevDay prevAnswer={prevAnswer} />}
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              completedDates={completedDates}
            />
          </div>
        </div>
      )}

      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        selectedDate={selectedDate}
        currentUserStatus={completedDates[selectedDate]}
        answer={answer}
        isAuthenticated={!!user}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSignIn={signIn}
        onSignUp={signUp}
      />

      <EasterEgg
        message={
          game.status === 'won' && game.guesses.length === 1 ? 'CHEATER!' :
          game.status === 'won' && game.guesses.length === 2 ? 'CHEATER!' :
          game.status === 'won' && game.guesses.length === 6 ? 'ALMOST BECAME THE STRIKE OUT QUEEN' :
          null
        }
      />
    </div>
  );
}
