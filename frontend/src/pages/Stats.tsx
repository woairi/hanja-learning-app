import React, { useState, useEffect } from 'react';
import { getStudyStats, getStudyProgress, getQuizResults, getWrongAnswers, formatStudyTime, StudyStats, StudyProgress, QuizResult } from '../utils/storage';

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [progressData, setProgressData] = useState<Record<string, StudyProgress>>({});
  const [recentResults, setRecentResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    setStats(getStudyStats());
    setProgressData(getStudyProgress());
    setRecentResults(getQuizResults().slice(-5).reverse());
  }, []);

  if (!stats) {
    return <div className="loading">통계를 불러오는 중...</div>;
  }

  const gradeOrder = ["준8급", "8급", "준7급", "7급", "준6급", "6급", "준5급", "5급", "준4급", "4급"];
  const sortedProgress = gradeOrder
    .filter(grade => progressData[grade])
    .map(grade => ({ grade, ...progressData[grade] }));

  return (
    <div className="stats">
      <div className="stats-header">
        <h1>📊 학습 통계</h1>
        <button onClick={() => window.location.href = '/'} className="home-button">
          홈으로
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{formatStudyTime(stats.totalStudyTime)}</div>
            <div className="stat-label">총 학습 시간</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalHanjaStudied}개</div>
            <div className="stat-label">학습한 한자</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalQuizzesTaken}회</div>
            <div className="stat-label">푼 문제</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageScore}점</div>
            <div className="stat-label">평균 점수</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.streakDays}일</div>
            <div className="stat-label">연속 학습</div>
          </div>
        </div>
      </div>

      {sortedProgress.length > 0 && (
        <div className="progress-section">
          <h2>급수별 학습 진도</h2>
          <div className="progress-list">
            {sortedProgress.map((progress) => (
              <div key={progress.grade} className="progress-item">
                <div className="progress-header">
                  <span className="grade-name">{progress.grade}</span>
                  <span className="progress-percent">
                    {Math.round((progress.completedCount / progress.totalCount) * 100)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(progress.completedCount / progress.totalCount) * 100}%` }}
                  ></div>
                </div>
                <div className="progress-details">
                  {progress.completedCount} / {progress.totalCount} 한자 학습 완료
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentResults.length > 0 && (
        <div className="recent-results-section">
          <h2>최근 퀴즈 결과</h2>
          <div className="results-list">
            {recentResults.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span className="result-grade">{result.grade}</span>
                  <span className="result-type">
                    {result.type === 'multiple-choice' && '객관식'}
                    {result.type === 'subjective' && '주관식'}
                    {result.type === 'hanja-word' && '한자어 객관식'}
                    {result.type === 'hanja-word-subjective' && '한자어 주관식'}
                  </span>
                  <span className="result-score">{result.score}점</span>
                </div>
                <div className="result-details">
                  정답: {result.correctAnswers}/{result.totalQuestions} 
                  ({Math.round((result.correctAnswers / result.totalQuestions) * 100)}%)
                </div>
                <div className="result-date">
                  {new Date(result.date).toLocaleDateString('ko-KR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="wrong-answers-section">
        <h2>틀린 문제 복습</h2>
        <div className="grade-review-buttons">
          {gradeOrder.map(grade => {
            const wrongCount = getWrongAnswers().filter(w => w.grade === grade).length;
            return wrongCount > 0 ? (
              <button 
                key={grade}
                className="grade-review-button"
                onClick={() => window.location.href = `/review/${grade}`}
              >
                <span className="grade-name">{grade}</span>
                <span className="wrong-count">{wrongCount}개</span>
              </button>
            ) : null;
          }).filter(Boolean)}
        </div>
        {getWrongAnswers().length === 0 && (
          <div className="no-wrong-answers">
            <div className="no-wrong-icon">🎉</div>
            <p>틀린 문제가 없습니다!</p>
          </div>
        )}
      </div>

      {stats.totalQuizzesTaken === 0 && sortedProgress.length === 0 && (
        <div className="no-data">
          <div className="no-data-icon">📈</div>
          <div className="no-data-text">
            아직 학습 데이터가 없습니다.<br />
            한자 학습을 시작해보세요!
          </div>
        </div>
      )}
    </div>
  );
};

export default Stats;