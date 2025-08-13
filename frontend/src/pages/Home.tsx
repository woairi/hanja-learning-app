import React, { useState, useEffect } from 'react';
import { hanjaApi } from '../utils/api';
import { Grade } from '../types';
import { getWrongAnswerCount } from '../utils/storage';

const Home: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const getGradeEmoji = (index: number): string => {
    const emojis = ['🌱', '🌿', '🌳', '🏆', '💎', '👑', '🌟', '🚀', '🎊', '🎉'];
    return emojis[index] || '📚';
  };

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const gradesData = await hanjaApi.getGrades();
        setGrades(gradesData);
      } catch (error) {
        console.error('급수 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-character">📚</div>
        <h1 className="hero-title">
          <span className="title-fun">재미있는</span>
          <span className="title-main">한자 학습</span>
          <span className="title-adventure">모험!</span>
        </h1>
        <p className="hero-subtitle">함께 한자 마스터가 되어보자! 🌟</p>
      </div>
      
      <div className="grade-selection">
        <div className="section-header">
          <h2 className="section-title">
            <span className="emoji">🎯</span>
            어떤 급수에 도전할까요?
            <span className="emoji">🎯</span>
          </h2>
          <button 
            className="stats-button"
            onClick={() => window.location.href = '/stats'}
          >
            📊 통계 보기
          </button>
        </div>
        <div className="grade-grid">
          {grades.map((grade, index) => (
            <button
              key={grade}
              className={`grade-button ${selectedGrade === grade ? 'selected' : ''}`}
              onClick={() => handleGradeSelect(grade)}
            >
              <div className="grade-emoji">{getGradeEmoji(index)}</div>
              <div className="grade-text">{grade}</div>
              <div className="grade-subtitle">도전!</div>
            </button>
          ))}
        </div>
      </div>
      
      {selectedGrade && (
        <div className="learning-options">
          <h3 className="options-title">
            <span className="sparkle">✨</span>
            {selectedGrade} 학습을 시작해보자!
            <span className="sparkle">✨</span>
          </h3>
          <div className="option-buttons">
            <button 
              className="option-button study-button"
              onClick={() => window.location.href = `/study/${selectedGrade}`}
            >
              <div className="option-icon">📖</div>
              <div className="option-text">
                <div className="option-title">기본 학습</div>
                <div className="option-desc">한자카드로 차근차근</div>
              </div>
            </button>
            <button 
              className="option-button quiz-button"
              onClick={() => window.location.href = `/quiz/${selectedGrade}`}
            >
              <div className="option-icon">🎮</div>
              <div className="option-text">
                <div className="option-title">객관식 문제</div>
                <div className="option-desc">게임처럼 재미있게</div>
              </div>
            </button>
            <button 
              className="option-button subjective-button"
              onClick={() => window.location.href = `/subjective-quiz/${selectedGrade}`}
            >
              <div className="option-icon">✍️</div>
              <div className="option-text">
                <div className="option-title">주관식 문제</div>
                <div className="option-desc">직접 써보며 학습</div>
              </div>
            </button>
            {/* 6급 이상만 한자어 독음 문제 제공 */}
            {['6급', '준5급', '5급', '준4급', '4급'].includes(selectedGrade) && (
              <>
                <button 
                  className="option-button hanja-word-button"
                  onClick={() => window.location.href = `/hanja-word-quiz/${selectedGrade}`}
                >
                  <div className="option-icon">📖</div>
                  <div className="option-text">
                    <div className="option-title">한자어 객관식</div>
                    <div className="option-desc">한자어 선택 문제</div>
                  </div>
                </button>
                <button 
                  className="option-button hanja-word-subjective-button"
                  onClick={() => window.location.href = `/hanja-word-subjective-quiz/${selectedGrade}`}
                >
                  <div className="option-icon">✍️</div>
                  <div className="option-text">
                    <div className="option-title">한자어 주관식</div>
                    <div className="option-desc">한자어 직접 입력</div>
                  </div>
                </button>
              </>
            )}
            <button 
              className="option-button review-button"
              onClick={() => window.location.href = `/review/${selectedGrade}`}
            >
              <div className="option-icon">🔄</div>
              <div className="option-text">
                <div className="option-title">틀린 문제 복습</div>
                <div className="option-desc">약한 부분 집중 학습 ({getWrongAnswerCount(selectedGrade)}개)</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;