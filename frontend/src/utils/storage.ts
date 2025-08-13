// 로컬 스토리지 유틸리티 함수들

export interface StudyProgress {
  grade: string;
  currentIndex: number;
  totalCount: number;
  completedCount: number;
  lastStudyDate: string;
  studyTime: number; // 초 단위
}

export interface QuizResult {
  grade: string;
  type: 'multiple-choice' | 'subjective' | 'hanja-word' | 'hanja-word-subjective' | 'review';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  studyTime: number;
}

export interface StudyStats {
  totalStudyTime: number;
  totalHanjaStudied: number;
  totalQuizzesTaken: number;
  averageScore: number;
  streakDays: number;
  lastStudyDate: string;
}

const STORAGE_KEYS = {
  STUDY_PROGRESS: 'hanja_study_progress',
  QUIZ_RESULTS: 'hanja_quiz_results',
  STUDY_STATS: 'hanja_study_stats',
  WRONG_ANSWERS: 'hanja_wrong_answers'
};

// 학습 진도 저장/불러오기
export const saveStudyProgress = (progress: StudyProgress): void => {
  const existingProgress = getStudyProgress();
  const updatedProgress = {
    ...existingProgress,
    [progress.grade]: progress
  };
  localStorage.setItem(STORAGE_KEYS.STUDY_PROGRESS, JSON.stringify(updatedProgress));
};

export const getStudyProgress = (): Record<string, StudyProgress> => {
  const stored = localStorage.getItem(STORAGE_KEYS.STUDY_PROGRESS);
  return stored ? JSON.parse(stored) : {};
};

export const getGradeProgress = (grade: string): StudyProgress | null => {
  const allProgress = getStudyProgress();
  return allProgress[grade] || null;
};

// 퀴즈 결과 저장/불러오기
export const saveQuizResult = (result: QuizResult): void => {
  const existingResults = getQuizResults();
  existingResults.push(result);
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(existingResults));
  updateStudyStats(result);
};

export const getQuizResults = (): QuizResult[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS);
  return stored ? JSON.parse(stored) : [];
};

// 학습 통계 업데이트
const updateStudyStats = (result: QuizResult): void => {
  const stats = getStudyStats();
  const today = new Date().toDateString();
  
  // 연속 학습 일수 계산
  let streakDays = stats.streakDays;
  if (stats.lastStudyDate !== today) {
    const lastDate = new Date(stats.lastStudyDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streakDays += 1;
    } else if (diffDays > 1) {
      streakDays = 1;
    }
  }

  const updatedStats: StudyStats = {
    totalStudyTime: stats.totalStudyTime + result.studyTime,
    totalHanjaStudied: stats.totalHanjaStudied + result.totalQuestions,
    totalQuizzesTaken: stats.totalQuizzesTaken + 1,
    averageScore: calculateAverageScore([...getQuizResults(), result]),
    streakDays,
    lastStudyDate: today
  };

  localStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(updatedStats));
};

export const getStudyStats = (): StudyStats => {
  const stored = localStorage.getItem(STORAGE_KEYS.STUDY_STATS);
  return stored ? JSON.parse(stored) : {
    totalStudyTime: 0,
    totalHanjaStudied: 0,
    totalQuizzesTaken: 0,
    averageScore: 0,
    streakDays: 0,
    lastStudyDate: ''
  };
};

const calculateAverageScore = (results: QuizResult[]): number => {
  if (results.length === 0) return 0;
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  return Math.round(totalScore / results.length);
};

// 틀린 문제 저장/불러오기
export interface WrongAnswer {
  character: string;
  grade: string;
  userAnswer: string;
  correctAnswer: string;
  type: string;
  date: string;
  attempts: number;
}

export const saveWrongAnswer = (wrongAnswer: WrongAnswer): void => {
  const existingWrong = getWrongAnswers();
  const existingIndex = existingWrong.findIndex(
    w => w.character === wrongAnswer.character && w.grade === wrongAnswer.grade
  );
  
  if (existingIndex >= 0) {
    existingWrong[existingIndex] = {
      ...wrongAnswer,
      attempts: existingWrong[existingIndex].attempts + 1
    };
  } else {
    existingWrong.push({ ...wrongAnswer, attempts: 1 });
  }
  
  localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(existingWrong));
};

export const getWrongAnswers = (grade?: string): WrongAnswer[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.WRONG_ANSWERS);
  const allWrong = stored ? JSON.parse(stored) : [];
  return grade ? allWrong.filter((w: WrongAnswer) => w.grade === grade) : allWrong;
};

export const removeWrongAnswer = (character: string, grade: string): void => {
  const existingWrong = getWrongAnswers();
  const filtered = existingWrong.filter(
    w => !(w.character === character && w.grade === grade)
  );
  localStorage.setItem(STORAGE_KEYS.WRONG_ANSWERS, JSON.stringify(filtered));
};

export const getWrongAnswerCount = (grade: string): number => {
  return getWrongAnswers(grade).length;
};

// 시간 포맷팅 유틸리티
export const formatStudyTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
};