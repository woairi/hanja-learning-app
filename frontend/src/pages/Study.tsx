import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hanjaApi } from '../utils/api';
import { Hanja } from '../types';
import { saveStudyProgress, getGradeProgress, StudyProgress } from '../utils/storage';

const Study: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const [hanjaList, setHanjaList] = useState<Hanja[]>([]);
  const [originalList, setOriginalList] = useState<Hanja[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isShuffled, setIsShuffled] = useState(false);
  const [hideReading, setHideReading] = useState(false);
  const [hideMeaning, setHideMeaning] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState(Date.now());

  useEffect(() => {
    const fetchHanja = async () => {
      if (!grade) return;
      
      try {
        const data = await hanjaApi.getHanjaByGrade(grade);
        setHanjaList(data);
        setOriginalList(data);
        
        const savedProgress = getGradeProgress(grade);
        if (savedProgress) {
          setCurrentIndex(savedProgress.currentIndex);
        }
      } catch (error) {
        console.error('한자 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHanja();
  }, [grade]);

  const currentHanja = hanjaList[currentIndex];

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const toggleShuffle = () => {
    if (isShuffled) {
      setHanjaList(originalList);
      setIsShuffled(false);
    } else {
      setHanjaList(shuffleArray(originalList));
      setIsShuffled(true);
    }
    setCurrentIndex(0);
  };

  const saveCurrentProgress = () => {
    if (!grade || hanjaList.length === 0) return;
    
    const studyTime = Math.floor((Date.now() - studyStartTime) / 1000);
    const progress: StudyProgress = {
      grade,
      currentIndex,
      totalCount: hanjaList.length,
      completedCount: currentIndex + 1,
      lastStudyDate: new Date().toISOString(),
      studyTime
    };
    
    saveStudyProgress(progress);
  };

  const nextHanja = () => {
    setCurrentIndex((prev) => (prev + 1) % hanjaList.length);
    saveCurrentProgress();
  };

  const prevHanja = () => {
    setCurrentIndex((prev) => (prev - 1 + hanjaList.length) % hanjaList.length);
    saveCurrentProgress();
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!currentHanja) {
    return <div className="error">한자 데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="study">
      <div className="study-header">
        <h1>{grade} 기본 학습</h1>
        <div className="header-controls">
          <div className="status-info">
            <div className="current-mode">{isShuffled ? '🔀 섞인 순서' : '📋 원래 순서'}</div>
            <button 
              className={`shuffle-button ${isShuffled ? 'active' : ''}`}
              onClick={toggleShuffle}
            >
              {isShuffled ? '순서대로' : '순서섞기'}
            </button>
          </div>
          <div className="progress-info">
            <div className="progress">
              {currentIndex + 1} / {hanjaList.length}
            </div>
            <div className="completion-rate">
              진도: {Math.round(((currentIndex + 1) / hanjaList.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="hanja-card">
        <div className="hanja-character">{currentHanja.character}</div>
        <div className="hanja-info">
          <div 
            className={`reading ${hideReading ? 'hidden' : ''}`}
            onClick={() => setHideReading(!hideReading)}
          >
            음: {hideReading ? '●●●' : currentHanja.reading}
          </div>
          <div 
            className={`meaning ${hideMeaning ? 'hidden' : ''}`}
            onClick={() => setHideMeaning(!hideMeaning)}
          >
            뜻: {hideMeaning ? '●●●' : currentHanja.meaning}
          </div>
        </div>
      </div>

      <div className="navigation">
        <button onClick={prevHanja} disabled={hanjaList.length <= 1}>
          이전
        </button>
        <button onClick={nextHanja} disabled={hanjaList.length <= 1}>
          다음
        </button>
      </div>

      <div className="actions">
        <button onClick={() => window.location.href = '/'}>
          홈으로
        </button>
        <button onClick={() => window.location.href = `/quiz/${grade}`}>
          문제 풀이
        </button>
      </div>
    </div>
  );
};

export default Study;