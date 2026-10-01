import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Trophy,
  Compass,
  Pause,
  LogIn,
  LogOut,
  Search,
  Download,
  CheckCircle2,
  Undo2,
  Sliders,
  Grid,
  Gamepad2,
  Heart,
} from 'lucide-react';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  submitCompletedScoreToFirebase,
  fetchPersonalScores,
  LeaderboardEntryItem,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  DATASET_ITEMS,
  DatasetItem,
  getLevelConfig,
  STAGE_BACKDROPS,
  ItemCategory,
} from './data/datasetItems';
import { soundFX } from './utils/sound';
import { PWAInstallButton, OfflineIndicator } from './PWAInstallButton';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'ROUND_SUMMARY' | 'GAME_OVER';
type ActiveSection = 'play' | 'levels' | 'leaderboard' | 'dataset';
type FieldDensityMode = '10_distractors' | '10_total';

interface BoardToken {
  uid: string;
  item: DatasetItem;
  isTarget: boolean;
  x: number; // percentage 12..88
  y: number; // percentage 16..84
  vx: number;
  vy: number;
  bobDelay: number;
}

const DEFAULT_LOCAL_SCORES: LeaderboardEntryItem[] = [
  { userId: 'champ_1', playerName: 'Marina Reef', score: 4850, levelReached: 5, matchesCount: 64 },
  { userId: 'champ_2', playerName: 'Kai Tidal', score: 3920, levelReached: 4, matchesCount: 51 },
  { userId: 'champ_3', playerName: 'Ayla Lagoon', score: 3180, levelReached: 3, matchesCount: 42 },
  { userId: 'champ_4', playerName: 'Devon Sandbar', score: 2450, levelReached: 3, matchesCount: 33 },
  { userId: 'champ_5', playerName: 'Sora Cascade', score: 1890, levelReached: 2, matchesCount: 24 },
];

function ResilientImage({
  src,
  alt,
  className,
  fallbackColor = '#0284C7',
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackColor?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full text-white font-semibold text-xs select-none ${className || ''}`}
        style={{
          background: `radial-gradient(circle at 35% 35%, ${fallbackColor}, #0F172A)`,
        }}
        aria-label={alt}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      draggable={false}
      className={className}
    />
  );
}

function buildSmoothBlueCurve(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }
  if (points.length === 2) {
    const midX = (points[0].x + points[1].x) / 2;
    const midY = (points[0].y + points[1].y) / 2 + 6;
    return `M ${points[0].x} ${points[0].y} Q ${midX} ${midY} ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const normX = -dy * 0.14;
    const normY = dx * 0.14;
    const ctrlX = Math.max(6, Math.min(94, midX + normX));
    const ctrlY = Math.max(8, Math.min(92, midY + normY));
    d += ` Q ${ctrlX} ${ctrlY} ${p1.x} ${p1.y}`;
  }
  return d;
}

export default function App() {
  // Mobile Navigation & Audio State
  const [activeSection, setActiveSection] = useState<ActiveSection>('play');
  const [muted, setMuted] = useState<boolean>(false);
  const [densityMode, setDensityMode] = useState<FieldDensityMode>('10_distractors');

  // Firebase Auth & Leaderboard State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [globalEntries, setGlobalEntries] = useState<LeaderboardEntryItem[]>([]);
  const [personalEntries, setPersonalEntries] = useState<LeaderboardEntryItem[]>([]);
  const [localEntries, setLocalEntries] = useState<LeaderboardEntryItem[]>(() => {
    try {
      const saved = localStorage.getItem('lagoonlink_local_scores');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage error
    }
    return DEFAULT_LOCAL_SCORES;
  });
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'personal'>('global');
  const [syncingScore, setSyncingScore] = useState<boolean>(false);
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);

  // Dataset Browser State
  const [datasetCategory, setDatasetCategory] = useState<'ALL' | ItemCategory>('ALL');
  const [datasetSearch, setDatasetSearch] = useState<string>('');

  // Core Game State Machine
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [level, setLevel] = useState<number>(1);
  const [stepInLevel, setStepInLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [totalMatchesLinked, setTotalMatchesLinked] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // Heart Recovery Milestone (3 consecutive flawless levels) & Daily Bonus State
  const [flawlessLevelStreak, setFlawlessLevelStreak] = useState<number>(0);
  const [hadFailureInCurrentLevel, setHadFailureInCurrentLevel] = useState<boolean>(false);
  const [milestoneRewardMessage, setMilestoneRewardMessage] = useState<string | null>(null);
  const todayDateKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dailyBonusClaimedDate, setDailyBonusClaimedDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem('lagoonlink_daily_heart_date');
    } catch {
      return null;
    }
  });
  const canClaimDailyBonus = dailyBonusClaimedDate !== todayDateKey;

  // Active Step Board State
  const [targetItem, setTargetItem] = useState<DatasetItem>(() => DATASET_ITEMS[60]); // #61 Dog
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [linkedTokenUids, setLinkedTokenUids] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(10.0);
  const [hintTokenUid, setHintTokenUid] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // Pointer / Touch Dragging State
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Level Wave Transition State (pushes background image & resets tokens)
  const [waveTransition, setWaveTransition] = useState<{
    active: boolean;
    prevBackdrop: string;
    prevTitle: string;
    nextLevel: number;
    nextDifficultyLabel: string;
    key: number;
  } | null>(null);
  const waveTimersRef = useRef<number[]>([]);

  const clearWaveTimers = useCallback(() => {
    waveTimersRef.current.forEach((id) => window.clearTimeout(id));
    waveTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearWaveTimers();
  }, [clearWaveTimers]);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !currentUser) {
      setGlobalEntries([]);
      setPersonalEntries([]);
      return;
    }

    const boardPath = 'leaderboards/global';
    const unsubGlobal = onSnapshot(
      doc(db, 'leaderboards', 'global'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.entries)) {
            setGlobalEntries(data.entries as LeaderboardEntryItem[]);
          }
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.GET, boardPath);
        } catch {
          // Handled & logged
        }
      }
    );

    fetchPersonalScores()
      .then((res) => setPersonalEntries(res))
      .catch(() => {});

    return () => unsubGlobal();
  }, [authReady, currentUser]);

  const recordCompletedRun = useCallback(
    async (finalScore: number, finalLevel: number, finalMatches: number) => {
      if (finalScore <= 0) return;
      const playerName =
        currentUser?.displayName ||
        currentUser?.email?.split('@')[0] ||
        'Local Explorer';

      const newEntry: LeaderboardEntryItem = {
        userId: currentUser?.uid || `local_${Date.now()}`,
        playerName,
        score: finalScore,
        levelReached: finalLevel,
        matchesCount: finalMatches,
      };

      setLocalEntries((prev) => {
        const updated = [...prev, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        try {
          localStorage.setItem('lagoonlink_local_scores', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      if (currentUser && currentUser.emailVerified) {
        setSyncingScore(true);
        try {
          await submitCompletedScoreToFirebase({
            score: finalScore,
            levelReached: finalLevel,
            matchesCount: finalMatches,
          });
          const personal = await fetchPersonalScores();
          setPersonalEntries(personal);
        } catch {
          // logged by handleFirestoreError
        } finally {
          setSyncingScore(false);
        }
      }
    },
    [currentUser]
  );

  const spawnStepTokens = useCallback(
    (
      lvl: number,
      forcedTarget?: DatasetItem,
      modeOverride?: FieldDensityMode
    ) => {
      const cfg = getLevelConfig(lvl);
      const activeMode = modeOverride || densityMode;

      const chosenTarget =
        forcedTarget ||
        DATASET_ITEMS[Math.floor(Math.random() * DATASET_ITEMS.length)];

      setTargetItem(chosenTarget);
      setLinkedTokenUids([]);
      setHintTokenUid(null);
      setTimeLeft(cfg.stepDurationSeconds);

      let candidateDistractors = DATASET_ITEMS.filter(
        (it) => it.id !== chosenTarget.id
      );

      if (cfg.lookalikeDistractors) {
        const sameCategoryOrColor = candidateDistractors.filter(
          (it) =>
            it.category === chosenTarget.category ||
            it.colorGroup === chosenTarget.colorGroup
        );
        if (sameCategoryOrColor.length >= 6) {
          candidateDistractors = sameCategoryOrColor;
        }
      }

      const distractorCount =
        activeMode === '10_distractors'
          ? 10
          : Math.max(4, 10 - cfg.targetCount);

      const totalCount = cfg.targetCount + distractorCount;
      const placedPositions: Array<{ x: number; y: number }> = [];

      const getSafePosition = (): { x: number; y: number } => {
        let bestX = 50;
        let bestY = 50;
        let maxMinDist = -1;

        for (let attempt = 0; attempt < 45; attempt++) {
          const cx = 13 + Math.random() * 74;
          const cy = 16 + Math.random() * 68;
          let minDist = 999;
          for (const pos of placedPositions) {
            const dx = cx - pos.x;
            const dy = cy - pos.y;
            const d = Math.hypot(dx, dy);
            if (d < minDist) minDist = d;
          }
          if (minDist >= 16.5) {
            placedPositions.push({ x: cx, y: cy });
            return { x: cx, y: cy };
          }
          if (minDist > maxMinDist) {
            maxMinDist = minDist;
            bestX = cx;
            bestY = cy;
          }
        }
        placedPositions.push({ x: bestX, y: bestY });
        return { x: bestX, y: bestY };
      };

      const newTokens: BoardToken[] = [];

      for (let i = 0; i < cfg.targetCount; i++) {
        const pos = getSafePosition();
        const angle = Math.random() * Math.PI * 2;
        newTokens.push({
          uid: `target_${i}_${Date.now()}`,
          item: chosenTarget,
          isTarget: true,
          x: pos.x,
          y: pos.y,
          vx: Math.cos(angle) * cfg.driftSpeed * 0.22,
          vy: Math.sin(angle) * cfg.driftSpeed * 0.22,
          bobDelay: (i * 0.4) % 2.5,
        });
      }

      for (let i = 0; i < distractorCount; i++) {
        const pos = getSafePosition();
        const randDistractor =
          candidateDistractors[
            Math.floor(Math.random() * candidateDistractors.length)
          ];
        const angle = Math.random() * Math.PI * 2;
        newTokens.push({
          uid: `dist_${i}_${Date.now()}`,
          item: randDistractor,
          isTarget: false,
          x: pos.x,
          y: pos.y,
          vx: Math.cos(angle) * cfg.driftSpeed * 0.22,
          vy: Math.sin(angle) * cfg.driftSpeed * 0.22,
          bobDelay: ((i + totalCount) * 0.35) % 2.5,
        });
      }

      setTokens(newTokens);
    },
    [densityMode]
  );

  // Subtle Wave Transition that pushes the stage background image and resets tokens
  const triggerWaveLevelTransition = useCallback(
    (fromLevel: number, toLevel: number, forcedTarget?: DatasetItem) => {
      clearWaveTimers();
      const fromCfg = getLevelConfig(fromLevel);
      const toCfg = getLevelConfig(toLevel);

      soundFX.playWaveTransition();
      setIsDragging(false);
      setDragPointer(null);
      setLinkedTokenUids([]);
      setHintTokenUid(null);
      setTokens([]);
      setTimeLeft(toCfg.stepDurationSeconds);

      setWaveTransition({
        active: true,
        prevBackdrop: fromCfg.stageBackdrop,
        prevTitle: fromCfg.title,
        nextLevel: toLevel,
        nextDifficultyLabel: toCfg.difficultyLabel,
        key: Date.now(),
      });

      // Spawn the fresh wave of tokens as the ocean crest passes through the arena
      const spawnTimer = window.setTimeout(() => {
        spawnStepTokens(toLevel, forcedTarget);
      }, 280);

      // Clear the wave transition state once the background push completes
      const endTimer = window.setTimeout(() => {
        setWaveTransition(null);
      }, 850);

      waveTimersRef.current = [spawnTimer, endTimer];
    },
    [clearWaveTimers, spawnStepTokens]
  );

  const startNewGame = useCallback(
    (forcedFirstItem?: DatasetItem, startingLevelOverride?: number) => {
      const targetLevel = startingLevelOverride ?? level;
      const prevLevel = level;
      setScore(0);
      setLevel(targetLevel);
      setStepInLevel(1);
      setLives(5);
      setTotalMatchesLinked(0);
      setStreak(0);
      setFlawlessLevelStreak(0);
      setHadFailureInCurrentLevel(false);
      setMilestoneRewardMessage(null);
      setFeedbackBanner(null);
      const openingItem =
        forcedFirstItem ||
        DATASET_ITEMS.find((it) => it.id === 'dog') ||
        DATASET_ITEMS[0];
      setGameState('PLAYING');
      setActiveSection('play');
      triggerWaveLevelTransition(prevLevel, targetLevel, openingItem);
    },
    [level, triggerWaveLevelTransition]
  );

  const handleSelectDifficultyLevel = useCallback(
    (chosenLevel: number, autoStart: boolean = true) => {
      const prevLevel = level;
      const cfg = getLevelConfig(chosenLevel);
      setLevel(chosenLevel);
      setStepInLevel(1);
      if (autoStart || gameState === 'PLAYING' || gameState === 'PAUSED') {
        setLives(5);
        setHadFailureInCurrentLevel(false);
        setMilestoneRewardMessage(null);
        setFeedbackBanner({
          type: 'info',
          text: `Wave Transition → Level ${chosenLevel} (${cfg.difficultyLabel}): Link ${cfg.targetCount} targets in 10s!`,
        });
        setGameState('PLAYING');
        setActiveSection('play');
        triggerWaveLevelTransition(prevLevel, chosenLevel, targetItem);
      }
    },
    [level, gameState, triggerWaveLevelTransition, targetItem]
  );

  const advanceAfterStepVictory = useCallback(
    (completedTimeLeft: number) => {
      const cfg = getLevelConfig(level);
      const timeBonus = Math.round(completedTimeLeft * 35);
      const stepPoints =
        cfg.targetCount * cfg.pointsPerTarget + timeBonus + streak * 50;
      let updatedScore = score + stepPoints;
      const updatedMatches = totalMatchesLinked + cfg.targetCount;

      setTotalMatchesLinked(updatedMatches);
      setStreak((s) => s + 1);
      soundFX.playStepSuccess();

      if (stepInLevel < cfg.stepsPerLevel) {
        setScore(updatedScore);
        const nextStep = stepInLevel + 1;
        setStepInLevel(nextStep);
        setFeedbackBanner({
          type: 'success',
          text: `Step Cleared! +${stepPoints} pts (${completedTimeLeft.toFixed(1)}s left)`,
        });
        spawnStepTokens(level);
      } else {
        if (!hadFailureInCurrentLevel) {
          const nextFlawless = flawlessLevelStreak + 1;
          if (nextFlawless >= 3) {
            setFlawlessLevelStreak(0);
            if (lives < 5) {
              setLives((l) => Math.min(5, l + 1));
              setMilestoneRewardMessage(
                '3 Consecutive Flawless Levels Milestone: +1 Lost Heart Recovered!'
              );
            } else {
              updatedScore += 500;
              setMilestoneRewardMessage(
                '3 Consecutive Flawless Levels Milestone: Full Hearts (+500 Bonus Pts)!'
              );
            }
          } else {
            setFlawlessLevelStreak(nextFlawless);
            setMilestoneRewardMessage(
              `Flawless Level Cleared! Milestone Progress: ${nextFlawless} / 3 toward +1 Heart Recovery`
            );
          }
        } else {
          setFlawlessLevelStreak(0);
          setMilestoneRewardMessage(
            'Level cleared — Complete 3 consecutive levels without failure to recover 1 heart (0 / 3)'
          );
        }

        setScore(updatedScore);
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.6 },
        });
        setGameState('ROUND_SUMMARY');
      }
    },
    [
      level,
      score,
      stepInLevel,
      streak,
      totalMatchesLinked,
      hadFailureInCurrentLevel,
      flawlessLevelStreak,
      lives,
      spawnStepTokens,
    ]
  );

  const proceedToNextLevel = useCallback(() => {
    const prevLvl = level;
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setStepInLevel(1);
    setHadFailureInCurrentLevel(false);
    setMilestoneRewardMessage(null);
    setFeedbackBanner({
      type: 'info',
      text: `Level ${nextLvl} Unlocked · Flawless Milestone: ${flawlessLevelStreak}/3`,
    });
    setGameState('PLAYING');
    triggerWaveLevelTransition(prevLvl, nextLvl);
  }, [level, flawlessLevelStreak, triggerWaveLevelTransition]);

  const handleClaimDailyBonus = useCallback(() => {
    if (!canClaimDailyBonus) return;
    try {
      localStorage.setItem('lagoonlink_daily_heart_date', todayDateKey);
    } catch {
      // ignore
    }
    setDailyBonusClaimedDate(todayDateKey);
    setLives((l) => Math.min(5, l + 1));
    setScore((s) => s + 250);
    soundFX.playStepSuccess();
    setFeedbackBanner({
      type: 'success',
      text: 'Daily Bonus Claimed: +1 Heart Recovered (up to 5) & +250 Pts!',
    });
  }, [canClaimDailyBonus, todayDateKey]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || waveTransition?.active) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = Math.max(0, Number((prev - 0.1).toFixed(1)));
        if (next <= 3.0 && next > 0 && Math.abs(next - Math.round(next)) < 0.05) {
          soundFX.playTimerTick();
        }
        return next;
      });

      setTokens((prevTokens) =>
        prevTokens.map((t) => {
          let nx = t.x + t.vx;
          let ny = t.y + t.vy;
          let nvx = t.vx;
          let nvy = t.vy;

          if (nx < 12 || nx > 88) nvx = -nvx;
          if (ny < 16 || ny > 84) nvy = -nvy;

          nx = Math.max(12, Math.min(88, nx));
          ny = Math.max(16, Math.min(84, ny));

          return { ...t, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, waveTransition?.active]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || waveTransition?.active) return;
    if (timeLeft > 0) return;

    soundFX.playWrongBuzz();
    setStreak(0);
    setHadFailureInCurrentLevel(true);
    setFlawlessLevelStreak(0);
    if (lives > 1) {
      setLives((l) => l - 1);
      setFeedbackBanner({
        type: 'error',
        text: '10s Expired! Lost 1 Heart — Try New Wave',
      });
      spawnStepTokens(level);
    } else {
      setLives(0);
      setGameState('GAME_OVER');
      recordCompletedRun(score, level, totalMatchesLinked);
    }
  }, [
    timeLeft,
    gameState,
    lives,
    level,
    score,
    totalMatchesLinked,
    spawnStepTokens,
    recordCompletedRun,
  ]);

  const handleSelectToken = useCallback(
    (token: BoardToken) => {
      if (gameState !== 'PLAYING') return;

      if (token.isTarget) {
        if (linkedTokenUids.includes(token.uid)) return;

        const nextLinked = [...linkedTokenUids, token.uid];
        setLinkedTokenUids(nextLinked);
        setHintTokenUid(null);
        soundFX.playLinkChime(nextLinked.length - 1);

        const totalTargetsOnBoard = tokens.filter((t) => t.isTarget).length;
        if (nextLinked.length >= totalTargetsOnBoard && totalTargetsOnBoard > 0) {
          setIsDragging(false);
          setDragPointer(null);
          advanceAfterStepVictory(timeLeft);
        }
      } else {
        soundFX.playWrongBuzz();
        setStreak(0);
        setHadFailureInCurrentLevel(true);
        setFlawlessLevelStreak(0);
        setLinkedTokenUids([]);
        setIsDragging(false);
        setDragPointer(null);

        if (lives > 1) {
          setLives((l) => l - 1);
          setFeedbackBanner({
            type: 'error',
            text: `Oops! That was ${token.item.name}, not ${targetItem.name}! (-1 Heart)`,
          });
        } else {
          setLives(0);
          setGameState('GAME_OVER');
          recordCompletedRun(score, level, totalMatchesLinked);
        }
      }
    },
    [
      gameState,
      linkedTokenUids,
      tokens,
      timeLeft,
      lives,
      targetItem.name,
      score,
      level,
      totalMatchesLinked,
      advanceAfterStepVictory,
      recordCompletedRun,
    ]
  );

  const handleBoardPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || gameState !== 'PLAYING' || !boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      setDragPointer({
        x: Math.max(0, Math.min(100, relX)),
        y: Math.max(0, Math.min(100, relY)),
      });

      for (const token of tokens) {
        const dist = Math.hypot(token.x - relX, token.y - relY);
        if (dist < 8.5) {
          if (token.isTarget && !linkedTokenUids.includes(token.uid)) {
            handleSelectToken(token);
          } else if (!token.isTarget && dist < 5.5) {
            handleSelectToken(token);
          }
          break;
        }
      }
    },
    [isDragging, gameState, tokens, linkedTokenUids, handleSelectToken]
  );

  const handleBoardPointerUp = useCallback(() => {
    setIsDragging(false);
    setDragPointer(null);
  }, []);

  const handleTriggerHint = () => {
    if (gameState !== 'PLAYING') return;
    const unlinkedTarget = tokens.find(
      (t) => t.isTarget && !linkedTokenUids.includes(t.uid)
    );
    if (unlinkedTarget) {
      setHintTokenUid(unlinkedTarget.uid);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.muted = next;
  };

  const linkedCoordinates = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    for (const uid of linkedTokenUids) {
      const found = tokens.find((t) => t.uid === uid);
      if (found) {
        pts.push({ x: found.x, y: found.y });
      }
    }
    if (isDragging && dragPointer && pts.length > 0) {
      pts.push(dragPointer);
    }
    return pts;
  }, [linkedTokenUids, tokens, isDragging, dragPointer]);

  const blueCurvePath = useMemo(
    () => buildSmoothBlueCurve(linkedCoordinates),
    [linkedCoordinates]
  );

  const currentLevelConfig = useMemo(() => getLevelConfig(level), [level]);
  const totalTargetsCount = useMemo(
    () => tokens.filter((t) => t.isTarget).length || currentLevelConfig.targetCount,
    [tokens, currentLevelConfig.targetCount]
  );

  const filteredDataset = useMemo(() => {
    return DATASET_ITEMS.filter((item) => {
      const matchesCat =
        datasetCategory === 'ALL' || item.category === datasetCategory;
      const matchesQuery =
        datasetSearch.trim() === '' ||
        item.name.toLowerCase().includes(datasetSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(datasetSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [datasetCategory, datasetSearch]);

  const displayedLeaderboard = useMemo(() => {
    if (leaderboardTab === 'personal' && currentUser) {
      return personalEntries.length > 0 ? personalEntries : localEntries;
    }
    if (globalEntries.length > 0) {
      return globalEntries;
    }
    return localEntries;
  }, [leaderboardTab, currentUser, personalEntries, globalEntries, localEntries]);

  const handleDownloadManifest = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(DATASET_ITEMS, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'dataset_100_images_manifest.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="min-h-screen h-[100dvh] w-full bg-[#03080D] text-slate-100 flex items-center justify-center sm:py-2 overflow-hidden">
      <OfflineIndicator />

      {/* STRICT 360px ANDROID MOBILE PHONE SHELL */}
      <div
        style={{ width: '100%', maxWidth: '360px' }}
        className="w-[360px] max-w-[360px] h-[100dvh] sm:h-[min(94dvh,740px)] bg-[#07131D] sm:rounded-[30px] sm:border-[4px] sm:border-slate-800/90 shadow-2xl flex flex-col relative overflow-hidden shrink-0"
      >
        {/* COMPACT MOBILE TOP APP BAR (46px Height) */}
        <header className="h-[46px] shrink-0 px-3 bg-[#07131D]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30">
          <a
            href="#play"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('play');
            }}
            className="font-display text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            LagoonLink
          </a>

          <div className="flex items-center gap-1 shrink-0">
            <PWAInstallButton />

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => signOutUser()}
                className="min-h-[32px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-100 flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
              >
                <LogOut className="w-3 h-3 text-sky-400" />
                <span className="max-w-[58px] truncate">
                  {currentUser.displayName || currentUser.email?.split('@')[0] || 'Out'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  setAuthErrorMsg(null);
                  try {
                    await signInWithGoogle();
                  } catch (err) {
                    setAuthErrorMsg(
                      err instanceof Error ? err.message : 'Sign-in cancelled'
                    );
                  }
                }}
                className="min-h-[32px] px-2 py-1 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-[10px] flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {authErrorMsg && (
          <div className="px-2.5 py-1 bg-amber-500/20 border-b border-amber-500/30 text-amber-200 text-[10px] flex items-center justify-between shrink-0 z-30">
            <span className="truncate">{authErrorMsg}</span>
            <button
              type="button"
              onClick={() => setAuthErrorMsg(null)}
              className="underline ml-2 shrink-0"
            >
              OK
            </button>
          </div>
        )}

        {/* MAIN MOBILE VIEWPORT BODY */}
        <main className="flex-1 w-full relative overflow-y-auto overflow-x-hidden flex flex-col">
          {/* ==================== TAB 1: PLAY ARENA ==================== */}
          {activeSection === 'play' && (
            <div className="flex-1 w-full relative flex flex-col justify-between select-none overflow-hidden">
              {/* Stage Background Photography (Fixed Tropical Beach Lagoon) + Contrast Scrim */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={STAGE_BACKDROPS.beachLagoon}
                  alt="Tropical Beach Lagoon"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-transparent to-slate-950/80 pointer-events-none" />
              </div>

              {/* TOP ANDROID GAME HUD (Compact for 360px Mobile Phone) */}
              <div className="relative z-20 px-2.5 pt-2 pb-1 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-100">
                  <div className="flex items-center gap-1 truncate">
                    <span className="font-semibold text-white">
                      L{level} {currentLevelConfig.difficultyLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      S{stepInLevel}/{currentLevelConfig.stepsPerLevel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-sky-300">
                      ♥ {lives}/5
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-300">
                      3-Lvl: {flawlessLevelStreak}/3
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-[11px] font-bold text-amber-300 shrink-0 pl-1">
                    {score.toLocaleString()} pts
                  </div>
                </div>

                {/* Quick Interactive Difficulty Level Switcher Bar */}
                <div className="grid grid-cols-5 gap-1 p-0.5 rounded-lg bg-slate-900/85 border border-white/10">
                  {[1, 2, 3, 4, 5].map((lvlNum) => {
                    const cfg = getLevelConfig(lvlNum);
                    const active = level === lvlNum;
                    return (
                      <button
                        key={lvlNum}
                        type="button"
                        onClick={() =>
                          handleSelectDifficultyLevel(
                            lvlNum,
                            gameState === 'PLAYING'
                          )
                        }
                        className={`py-1 px-0.5 rounded-md text-[9px] font-medium whitespace-nowrap truncate transition-colors ${
                          active
                            ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        L{lvlNum} {cfg.difficultyLabel}
                      </button>
                    );
                  })}
                </div>

                {/* 10-Second Step Timer Bar */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-mono tabular-nums">
                    <span className="text-slate-200">
                      10s Window ·{' '}
                      {timeLeft <= 3.0 ? 'HURRY!' : 'LINK TARGETS'}
                    </span>
                    <span
                      className={`font-semibold ${
                        timeLeft <= 3.0 ? 'text-rose-300' : 'text-sky-200'
                      }`}
                    >
                      {timeLeft.toFixed(1)}s / 10.0s
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-900/80 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-100 ${
                        timeLeft <= 3.0
                          ? 'bg-rose-500'
                          : timeLeft <= 6.0
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                      }`}
                      style={{
                        width: `${Math.min(100, (timeLeft / 10) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Target Item Mission Prompt */}
                {gameState === 'PLAYING' && (
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-white/15">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white/10 p-0.5 shrink-0 flex items-center justify-center">
                        <ResilientImage
                          src={targetItem.imagePath}
                          alt={targetItem.name}
                          className="w-7 h-7 rounded-full object-cover"
                          fallbackColor={targetItem.primaryColor}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] text-sky-300 font-medium truncate">
                          Connect matching items:
                        </div>
                        <div className="text-xs font-display font-bold text-white truncate">
                          {targetItem.name}{' '}
                          <span className="text-[10px] font-sans font-normal text-slate-300">
                            · {targetItem.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="text-[9px] text-slate-300">Linked</div>
                      <div className="font-mono tabular-nums text-xs font-bold text-sky-300">
                        {linkedTokenUids.length} / {totalTargetsCount}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* MIDDLE: INTERACTIVE LAGOON MATCHING FIELD + BLUE PATH OVERLAY */}
              <div
                ref={boardRef}
                onPointerMove={handleBoardPointerMove}
                onPointerUp={handleBoardPointerUp}
                onPointerCancel={handleBoardPointerUp}
                className="relative z-10 flex-1 w-full touch-none overflow-hidden"
              >
                {gameState === 'PLAYING' && linkedCoordinates.length > 0 && (
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  >
                    <path
                      d={blueCurvePath}
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="4.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.45"
                    />
                    <path
                      d={blueCurvePath}
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="3.1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={blueCurvePath}
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}

                {/* SUBTLE OCEAN WAVE LEVEL TRANSITION CREST */}
                {waveTransition?.active && (
                  <div
                    key={`wave_crest_${waveTransition.key}`}
                    className="absolute inset-x-0 inset-y-0 z-25 pointer-events-none flex flex-col justify-center animate-wave-crest"
                  >
                    <svg
                      viewBox="0 0 400 120"
                      preserveAspectRatio="none"
                      className="w-full h-24 drop-shadow-lg"
                    >
                      <path
                        d="M 0 55 Q 100 15 200 55 T 400 55 L 400 120 L 0 120 Z"
                        fill="rgba(56, 189, 248, 0.28)"
                      />
                      <path
                        d="M 0 65 Q 100 105 200 65 T 400 65 L 400 120 L 0 120 Z"
                        fill="rgba(2, 132, 199, 0.36)"
                      />
                      <path
                        d="M 0 55 Q 100 15 200 55 T 400 55"
                        fill="none"
                        stroke="rgba(224, 242, 254, 0.75)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="bg-gradient-to-b from-sky-600/35 via-sky-500/20 to-transparent py-2.5 text-center">
                      <span className="font-display text-xs font-bold tracking-wide text-sky-100 drop-shadow">
                        Tidal Wave → Level {waveTransition.nextLevel} ({waveTransition.nextDifficultyLabel})
                      </span>
                    </div>
                  </div>
                )}

                {gameState === 'PLAYING' &&
                  tokens.map((token, tokenIdx) => {
                    const isLinked = linkedTokenUids.includes(token.uid);
                    const linkOrder = linkedTokenUids.indexOf(token.uid) + 1;
                    const isHinted = hintTokenUid === token.uid;

                    return (
                      <button
                        key={token.uid}
                        type="button"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          setIsDragging(true);
                          handleSelectToken(token);
                        }}
                        style={{
                          left: `${token.x}%`,
                          top: `${token.y}%`,
                          animationDelay: `${token.bobDelay}s`,
                        }}
                        aria-label={`Select ${token.item.name}`}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-150 focus:outline-none ${
                          isLinked
                            ? 'scale-110 ring-4 ring-blue-500 bg-blue-600/30 shadow-lg shadow-blue-600/50'
                            : isHinted
                            ? 'scale-110 ring-4 ring-amber-400 bg-amber-400/25 animate-pulse'
                            : 'hover:scale-105 active:scale-95 animate-bob'
                        }`}
                      >
                        <div
                          className="w-full h-full flex items-center justify-center animate-token-wave-in"
                          style={{
                            animationDelay: `${(tokenIdx * 0.03).toFixed(2)}s`,
                          }}
                        >
                          <ResilientImage
                            src={token.item.imagePath}
                            alt={token.item.name}
                            className="w-9 h-9 rounded-full object-cover drop-shadow-md pointer-events-none"
                            fallbackColor={token.item.primaryColor}
                          />
                        </div>
                        {isLinked && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-mono tabular-nums text-[9px] font-bold flex items-center justify-center shadow">
                            {linkOrder}
                          </span>
                        )}
                      </button>
                    );
                  })}

                {/* OVERLAY: TITLE MENU */}
                {gameState === 'TITLE_MENU' && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-3.5 text-center bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center mb-2 shadow-inner">
                      <ResilientImage
                        src="/images/dog.svg"
                        alt="Dog token"
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                    <h1 className="font-display text-xl font-bold text-white mb-0.5">
                      LagoonLink Mobile
                    </h1>
                    <p className="text-[11px] text-slate-300 max-w-[290px] mb-2.5 leading-snug">
                      Connect all matching target items scattered across 10
                      decoys within 10 seconds per wave.
                    </p>

                    {/* Choose Difficulty Level Selector */}
                    <div className="w-full max-w-[304px] mb-2.5 text-left">
                      <div className="flex items-center justify-between text-[10px] text-slate-300 mb-1 px-1">
                        <span className="font-semibold text-white">
                          Choose Difficulty Level:
                        </span>
                        <span className="text-sky-300 font-mono tabular-nums">
                          {currentLevelConfig.targetCount} targets · 10s
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900/95 rounded-xl border border-white/10">
                        {[1, 2, 3, 4, 5].map((lvlNum) => {
                          const cfg = getLevelConfig(lvlNum);
                          const isSelected = level === lvlNum;
                          return (
                            <button
                              key={lvlNum}
                              type="button"
                              onClick={() => setLevel(lvlNum)}
                              className={`min-h-[36px] py-1 px-0.5 rounded-lg text-[9px] font-medium flex flex-col items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-sky-400 text-slate-950 font-bold shadow'
                                  : 'text-slate-300 hover:text-white'
                              }`}
                            >
                              <span>Lvl {lvlNum}</span>
                              <span className="text-[8px] opacity-85 truncate max-w-full">
                                {cfg.difficultyLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mode Selector */}
                    <div className="w-full max-w-[304px] mb-3 p-1 bg-slate-900/90 rounded-xl border border-white/10 grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        onClick={() => setDensityMode('10_distractors')}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                          densityMode === '10_distractors'
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        10 Other Items + Targets
                      </button>
                      <button
                        type="button"
                        onClick={() => setDensityMode('10_total')}
                        className={`py-1.5 px-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                          densityMode === '10_total'
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        10 Total Board Items
                      </button>
                    </div>

                    <div className="w-full max-w-[304px] space-y-2">
                      <button
                        type="button"
                        onClick={() => startNewGame(undefined, level)}
                        className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-transform whitespace-nowrap"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          Start Level {level} ({currentLevelConfig.difficultyLabel})
                        </span>
                      </button>

                      <PWAInstallButton variant="banner" />
                    </div>
                  </div>
                )}

                {/* OVERLAY: PAUSED */}
                {gameState === 'PAUSED' && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center bg-slate-950/85 backdrop-blur-md">
                    <h2 className="font-display text-xl font-bold text-white mb-1">
                      Game Paused
                    </h2>
                    <p className="text-[11px] text-slate-300 mb-3">
                      Level {level} ({currentLevelConfig.difficultyLabel}) · Step{' '}
                      {stepInLevel} · {timeLeft.toFixed(1)}s remaining
                    </p>

                    <div className="w-full max-w-[300px] mb-3 text-left">
                      <div className="text-[10px] text-slate-400 mb-1 px-1">
                        Switch Difficulty Level:
                      </div>
                      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-900 rounded-xl border border-white/10">
                        {[1, 2, 3, 4, 5].map((lvlNum) => {
                          const cfg = getLevelConfig(lvlNum);
                          return (
                            <button
                              key={lvlNum}
                              type="button"
                              onClick={() =>
                                handleSelectDifficultyLevel(lvlNum, true)
                              }
                              className={`min-h-[34px] py-1 px-0.5 rounded-lg text-[9px] font-medium flex flex-col items-center justify-center transition-colors ${
                                level === lvlNum
                                  ? 'bg-sky-400 text-slate-950 font-bold'
                                  : 'text-slate-300 hover:text-white'
                              }`}
                            >
                              <span>L{lvlNum}</span>
                              <span className="text-[8px]">
                                {cfg.difficultyLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full max-w-[300px] space-y-2">
                      <button
                        type="button"
                        onClick={() => setGameState('PLAYING')}
                        className="w-full min-h-[40px] py-2 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Step</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => startNewGame(undefined, level)}
                        className="w-full min-h-[40px] py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          Restart Level {level} ({currentLevelConfig.difficultyLabel})
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* OVERLAY: ROUND / LEVEL SUMMARY */}
                {gameState === 'ROUND_SUMMARY' && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center bg-slate-950/85 backdrop-blur-md">
                    <CheckCircle2 className="w-9 h-9 text-emerald-400 mb-1.5" />
                    <h2 className="font-display text-xl font-bold text-white mb-0.5">
                      Level {level} Cleared!
                    </h2>
                    <p className="text-[11px] text-slate-300 mb-3">
                      {currentLevelConfig.title} mastered · Streak {streak}x
                    </p>

                    <div className="w-full max-w-[300px] rounded-2xl bg-slate-900/90 border border-white/10 p-3.5 mb-3.5 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cumulative Score</span>
                        <span className="font-mono tabular-nums font-bold text-amber-300">
                          {score.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hearts Remaining</span>
                        <span className="font-mono tabular-nums font-semibold text-sky-300">
                          {lives} / 5 Hearts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Next Difficulty</span>
                        <span className="text-sky-300 font-medium">
                          Level {level + 1} ({getLevelConfig(level + 1).targetCount} targets / 10s)
                        </span>
                      </div>
                      {milestoneRewardMessage && (
                        <div className="pt-1.5 border-t border-white/10 text-emerald-300 font-medium text-[10px]">
                          {milestoneRewardMessage}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={proceedToNextLevel}
                      className="w-full max-w-[300px] min-h-[42px] py-2.5 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold text-sm flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Continue to Level {level + 1}</span>
                    </button>
                  </div>
                )}

                {/* OVERLAY: GAME OVER */}
                {gameState === 'GAME_OVER' && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center bg-slate-950/90 backdrop-blur-md">
                    <Trophy className="w-9 h-9 text-amber-400 mb-1.5" />
                    <h2 className="font-display text-xl font-bold text-white mb-0.5">
                      Lagoon Run Complete
                    </h2>
                    <p className="text-[11px] text-slate-300 mb-3">
                      Reached Level {level} · Linked {totalMatchesLinked} dataset items
                    </p>

                    <div className="w-full max-w-[300px] rounded-2xl bg-slate-900 border border-white/10 p-3.5 mb-3.5 space-y-1.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Final Score</span>
                        <span className="font-mono tabular-nums text-base font-bold text-amber-300">
                          {score.toLocaleString()} pts
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Leaderboard Status</span>
                        <span className="text-emerald-300 font-medium">
                          {syncingScore
                            ? 'Syncing...'
                            : currentUser
                            ? 'Saved to Global'
                            : 'Saved Locally'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full max-w-[300px] space-y-1.5">
                      <button
                        type="button"
                        onClick={() => startNewGame()}
                        className="w-full min-h-[40px] py-2 px-5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Play Again</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSection('leaderboard')}
                        className="w-full min-h-[38px] py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Leaderboard</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM NATURAL THUMB ZONE: TACTILE GAME CONTROLS */}
              <div className="relative z-20 px-2.5 py-2 bg-slate-950/90 backdrop-blur-md border-t border-white/10">
                {feedbackBanner && (
                  <div
                    className={`mb-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center justify-between ${
                      feedbackBanner.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : feedbackBanner.type === 'error'
                        ? 'bg-rose-500/25 text-rose-200'
                        : 'bg-sky-500/20 text-sky-200'
                    }`}
                  >
                    <span className="truncate">{feedbackBanner.text}</span>
                    <button
                      type="button"
                      onClick={() => setFeedbackBanner(null)}
                      className="ml-2 text-[9px] underline shrink-0"
                    >
                      OK
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    disabled={gameState !== 'PLAYING'}
                    onClick={handleTriggerHint}
                    className="min-h-[38px] px-1.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-medium text-amber-300 flex items-center justify-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <Compass className="w-3 h-3 shrink-0" />
                    <span>Hint</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      gameState !== 'PLAYING' || linkedTokenUids.length === 0
                    }
                    onClick={() => setLinkedTokenUids([])}
                    className="min-h-[38px] px-1.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-medium text-slate-200 flex items-center justify-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <Undo2 className="w-3 h-3 shrink-0" />
                    <span>Clear</span>
                  </button>

                  <button
                    type="button"
                    disabled={!canClaimDailyBonus}
                    onClick={handleClaimDailyBonus}
                    className="min-h-[38px] px-1.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-medium text-emerald-300 flex items-center justify-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <Heart className="w-3 h-3 shrink-0" />
                    <span>+1 Heart</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      gameState !== 'PLAYING' && gameState !== 'PAUSED'
                    }
                    onClick={() =>
                      setGameState((s) =>
                        s === 'PLAYING' ? 'PAUSED' : 'PLAYING'
                      )
                    }
                    className="min-h-[38px] px-1.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 disabled:opacity-40 text-[10px] font-medium text-sky-300 flex items-center justify-center gap-1 whitespace-nowrap transition-colors"
                  >
                    <Pause className="w-3 h-3 shrink-0" />
                    <span>{gameState === 'PAUSED' ? 'Resume' : 'Pause'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: LEVELS & MILESTONES ==================== */}
          {activeSection === 'levels' && (
            <div className="p-3 space-y-3 pb-5">
              <div className="flex justify-center">
                <PWAInstallButton variant="banner" />
              </div>

              {/* 3-Level Flawless Heart Milestone & Daily Bonus Card */}
              <div className="rounded-xl bg-slate-900/90 border border-white/10 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-white">
                    Heart Recovery & Daily Bonus
                  </h2>
                  <span className="font-mono tabular-nums text-[11px] text-emerald-400 font-semibold">
                    {flawlessLevelStreak} / 3 Flawless
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-200"
                    style={{
                      width: `${Math.min(100, (flawlessLevelStreak / 3) * 100)}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Complete <strong>3 consecutive levels without failure</strong> to
                  automatically recover <strong>+1 lost heart</strong> (up to 5).
                </p>

                <button
                  type="button"
                  disabled={!canClaimDailyBonus}
                  onClick={handleClaimDailyBonus}
                  className={`w-full min-h-[38px] rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    canClaimDailyBonus
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>
                    {canClaimDailyBonus
                      ? 'Claim Daily Bonus (+1 Heart & +250 Pts)'
                      : 'Daily Heart Bonus Claimed Today'}
                  </span>
                </button>
              </div>

              {/* Choose Difficulty Level */}
              <div className="rounded-xl bg-slate-900/90 border border-white/10 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-bold text-white">
                    Choose Difficulty Level
                  </h2>
                  <span className="text-[10px] text-slate-400">
                    Tap to launch
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {[1, 2, 3, 4, 5].map((lvlNum) => {
                    const cfg = getLevelConfig(lvlNum);
                    const isCurrent = level === lvlNum;
                    return (
                      <button
                        key={lvlNum}
                        type="button"
                        onClick={() => handleSelectDifficultyLevel(lvlNum, true)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-sky-500/15 border-sky-400 text-white'
                            : 'bg-slate-950/60 border-white/10 text-slate-300 hover:border-sky-400/50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-xs truncate">
                            0{lvlNum}. {cfg.difficultyLabel} — {cfg.title}
                          </div>
                          <div className="text-slate-400 text-[10px] truncate">
                            {cfg.targetCount} targets · 10s ·{' '}
                            {cfg.lookalikeDistractors
                              ? 'Color/Category decoys'
                              : 'Mixed decoys'}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono tabular-nums text-[11px] text-sky-300 font-semibold">
                            +{cfg.pointsPerTarget}
                          </div>
                          <div className="text-[9px] text-emerald-400 font-medium">
                            Play →
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick-Spawn Target Wave */}
              <div className="rounded-xl bg-slate-900/90 border border-white/10 p-3 space-y-2.5">
                <div className="text-[11px] font-semibold text-white">
                  Quick-Spawn Target Item (10s Wave):
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      'dog',
                      'kiwi',
                      'pear',
                      'spoon',
                      'cycle',
                      'pen',
                      'apple',
                      'strawberry',
                    ] as const
                  ).map((slug) => {
                    const found = DATASET_ITEMS.find((i) => i.id === slug);
                    if (!found) return null;
                    return (
                      <button
                        key={found.id}
                        type="button"
                        onClick={() => startNewGame(found)}
                        className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-[11px] font-medium text-slate-100 flex items-center gap-2 truncate transition-colors"
                      >
                        <ResilientImage
                          src={found.imagePath}
                          alt={found.name}
                          className="w-5 h-5 rounded-full object-cover shrink-0"
                        />
                        <span className="truncate">{found.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: LEADERBOARD ==================== */}
          {activeSection === 'leaderboard' && (
            <div className="p-3 space-y-3 pb-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="font-display text-base font-bold text-white">
                    High Score Ranks
                  </h1>
                  <p className="text-[10px] text-slate-400">
                    Live Firestore Top 10 & personal runs
                  </p>
                </div>

                <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setLeaderboardTab('global')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                      leaderboardTab === 'global'
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    Global
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaderboardTab('personal')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-colors ${
                      leaderboardTab === 'personal'
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    My Runs
                  </button>
                </div>
              </div>

              {!currentUser && (
                <div className="rounded-xl bg-slate-900/90 border border-sky-500/30 p-3 flex items-center justify-between gap-2.5">
                  <div className="text-[11px] text-slate-300">
                    Sign in with Google to sync your high scores to the global
                    leaderboard.
                  </div>
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-sky-400 text-slate-950 font-semibold text-[11px] whitespace-nowrap shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="rounded-xl bg-slate-900/90 border border-white/10 divide-y divide-white/10 overflow-hidden">
                {displayedLeaderboard.map((item, index) => (
                  <div
                    key={`${item.userId}_${index}`}
                    className="px-3 py-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono tabular-nums font-bold text-slate-400 w-5 text-[11px]">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-white truncate">
                          {item.playerName}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          Level {item.levelReached} · {item.matchesCount} items
                        </div>
                      </div>
                    </div>
                    <div className="font-mono tabular-nums text-xs font-bold text-amber-300 shrink-0">
                      {item.score.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: DATASET (100 IMAGES) ==================== */}
          {activeSection === 'dataset' && (
            <div className="p-3 space-y-3 pb-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h1 className="font-display text-base font-bold text-white">
                    Dataset Images (100)
                  </h1>
                  <p className="text-[10px] text-slate-400">
                    Stored in <code className="text-sky-300">/images/</code> · Tap
                    any item to play
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-100 flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3 h-3 text-sky-400" />
                  <span>JSON</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={datasetSearch}
                  onChange={(e) => setDatasetSearch(e.target.value)}
                  placeholder="Search 100 dataset items..."
                  className="w-full min-h-[38px] pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-white/10 overflow-x-auto">
                {(
                  [
                    { id: 'ALL', label: 'All (100)' },
                    { id: 'Fruit', label: 'Fruits (50)' },
                    { id: 'Animal', label: 'Animals (30)' },
                    { id: 'Nature', label: 'Nature (9)' },
                    { id: 'Object', label: 'Objects (11)' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDatasetCategory(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors ${
                      datasetCategory === tab.id
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 2-Column Mobile Touch Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {filteredDataset.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-900/90 border border-white/10 p-2.5 flex flex-col items-center text-center"
                  >
                    <div className="w-12 h-12 mb-1.5 flex items-center justify-center">
                      <ResilientImage
                        src={item.imagePath}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                        fallbackColor={item.primaryColor}
                      />
                    </div>
                    <div className="font-semibold text-xs text-white truncate w-full">
                      {item.name}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5 mb-2 font-mono tabular-nums truncate w-full">
                      #{String(item.index).padStart(3, '0')} · {item.category}
                    </div>
                    <button
                      type="button"
                      onClick={() => startNewGame(item)}
                      className="w-full min-h-[34px] py-1 px-2 rounded-lg bg-slate-800 hover:bg-sky-400 hover:text-slate-950 text-[10px] font-medium text-sky-300 transition-colors whitespace-nowrap"
                    >
                      Play {item.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* FIXED BOTTOM MOBILE TAB BAR (52px Height) */}
        <nav className="h-[52px] shrink-0 bg-[#07131D]/95 backdrop-blur-md border-t border-white/10 grid grid-cols-4 items-center z-30">
          <button
            type="button"
            onClick={() => setActiveSection('play')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeSection === 'play' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="text-[9px] font-medium tracking-tight mt-0.5">
              Play
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('levels')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeSection === 'levels' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span className="text-[9px] font-medium tracking-tight mt-0.5">
              Levels
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('leaderboard')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeSection === 'leaderboard' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span className="text-[9px] font-medium tracking-tight mt-0.5">
              Ranks
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('dataset')}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              activeSection === 'dataset' ? 'text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="text-[9px] font-medium tracking-tight mt-0.5">
              Dataset
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
