import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hanjaApi } from '../utils/api';
import { Hanja } from '../types';
import { getWrongAnswers, removeWrongAnswer, WrongAnswer } from '../utils/storage';

const ReviewQuiz: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [hanjaList, setHanjaList] = useState<Hanja[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWrongAnswers = async () => {
      if (!grade) return;
      
      try {
        const allWrongAnswers = getWrongAnswers();
        const gradeWrongAnswers = allWrongAnswers.filter(w => w.grade === grade);
        setWrongAnswers(gradeWrongAnswers);
        
        if (gradeWrongAnswers.length > 0) {
          const characters = gradeWrongAnswers.map(w => w.character);
          const allHanja = await hanjaApi.getHanjaByGrade(grade);
          const wrongHanja = allHanja.filter(h => characters.includes(h.character));
          setHanjaList(wrongHanja);
        }
      } catch (error) {
        console.error('틀린 문제 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWrongAnswers();
  }, [grade]);

  const currentHanja = hanjaList[currentIndex];
  const currentWrongAnswer = wrongAnswers.find(w => w.character === currentHanja?.character);

  const markAsCorrect = () => {
    if (currentHanja && grade) {
      removeWrongAnswer(currentHanja.character, grade);
      const newWrongAnswers = wrongAnswers.filter(w => w.character !== currentHanja.character);
      const newHanjaList = hanjaList.filter(h => h.character !== currentHanja.character);
      
      setWrongAnswers(newWrongAnswers);
      setHanjaList(newHanjaList);
      
      if (currentIndex >= newHanjaList.length && newHanjaList.length > 0) {
        setCurrentIndex(newHanjaList.length - 1);
      } else if (newHanjaList.length === 0) {
        setCurrentIndex(0);
      }
      
      setShowAnswer(false);
    }
  };

  const nextHanja = () => {
    if (currentIndex < hanjaList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };

  const prevHanja = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };

  if (loading) {
    return <div className="loading">틀린 문제를 불러오는 중...</div>;
  }

  if (hanjaList.length === 0) {
    return (
      <div className="review-empty">
        <div className="empty-icon">🎉</div>
        <h2>복습할 문제가 없습니다!</h2>
        <p>모든 문제를 정확히 풀었거나, 아직 틀린 문제가 없습니다.</p>
        <div className="actions">
          <button onClick={() => window.location.href = `/quiz/${grade}`}>
            문제 풀기
          </button>
          <button onClick={() => window.location.href = '/'}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-quiz">
      <div className="review-header">
        <h1>{grade} 틀린 문제 복습</h1>
        <div className="review-progress">
          {currentIndex + 1} / {hanjaList.length}
        </div>
      </div>

      <div className="review-card">
        <div className="hanja-character">{currentHanja.character}</div>
        
        {currentWrongAnswer && (
          <div className="wrong-info">
            <div className="wrong-label">이전 답안:</div>
            <div className="wrong-answer">{currentWrongAnswer.userAnswer}</div>
            <div className="attempts">틀린 횟수: {currentWrongAnswer.attempts}회</div>
          </div>
        )}

        <div className="answer-section">
          {!showAnswer ? (
            <button 
              className="show-answer-button"
              onClick={() => setShowAnswer(true)}
            >
              정답 보기
            </button>
          ) : (
            <div className="answer-display">
              <div className="correct-answer">
                <div className="reading">음: {currentHanja.reading}</div>
                <div className="meaning">뜻: {currentHanja.meaning}</div>
              </div>
              <div className="review-actions">
                <button 
                  className="correct-button"
                  onClick={markAsCorrect}
                >
                  ✓ 이제 알겠어요
                </button>
                <button 
                  className="study-more-button"
                  onClick={() => setShowAnswer(false)}
                >
                  더 공부하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="navigation">
        <button onClick={prevHanja} disabled={currentIndex === 0}>
          이전
        </button>
        <button onClick={nextHanja} disabled={currentIndex === hanjaList.length - 1}>
          다음
        </button>
      </div>

      <div className="actions">
        <button onClick={() => window.location.href = '/'}>
          홈으로
        </button>
        <button onClick={() => window.location.href = `/quiz/${grade}`}>
          문제 풀기
        </button>
      </div>
    </div>
  );
};

export default ReviewQuiz;