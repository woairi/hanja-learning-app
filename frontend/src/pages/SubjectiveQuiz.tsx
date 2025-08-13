import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hanjaApi } from '../utils/api';
import { Question, AnswerResult } from '../types';
import { saveQuizResult, QuizResult, saveWrongAnswer, WrongAnswer } from '../utils/storage';

const SubjectiveQuiz: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userReading, setUserReading] = useState('');
  const [userMeaning, setUserMeaning] = useState('');
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [quizStartTime] = useState(Date.now());

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!grade) return;
      
      try {
        const data = await hanjaApi.generateSubjectiveQuestions(grade, 10);
        setQuestions(data);
      } catch (error) {
        console.error('문제 생성 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [grade]);

  const currentQuestion = questions[currentQuestionIndex];

  const getSimilarityMessage = (similarity?: number) => {
    if (!similarity) return '';
    if (similarity >= 0.9) return '완벽합니다!';
    if (similarity >= 0.8) return '거의 정확합니다!';
    if (similarity >= 0.7) return '비슷하지만 틀렸습니다.';
    if (similarity >= 0.6) return '조금 비슷합니다.';
    return '많이 다릅니다.';
  };

  const handleSubmitAnswer = async () => {
    if ((!userReading.trim() && !userMeaning.trim()) || !currentQuestion) return;

    const userAnswer = `${userReading.trim()}, ${userMeaning.trim()}`;
    try {
      const result = await hanjaApi.checkAnswer(userAnswer, currentQuestion.answer);
      setAnswerResult(result);
      setTotalScore(prev => prev + result.score);
      setAnswered(true);
      
      // 틀린 문제 저장 (점수가 80점 미만인 경우)
      if (result.score < 80 && grade) {
        const wrongAnswer: WrongAnswer = {
          character: currentQuestion.character,
          grade,
          userAnswer,
          correctAnswer: currentQuestion.answer,
          type: 'subjective',
          date: new Date().toISOString(),
          attempts: 1
        };
        saveWrongAnswer(wrongAnswer);
      }
    } catch (error) {
      console.error('답안 채점 실패:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserReading('');
      setUserMeaning('');
      setAnswerResult(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserReading('');
    setUserMeaning('');
    setAnswerResult(null);
    setTotalScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  if (loading) {
    return <div className="loading">문제를 생성하고 있습니다...</div>;
  }

  if (showResult) {
    const finalScore = Math.round((totalScore / (questions.length * 100)) * 100);
    
    React.useEffect(() => {
      if (grade) {
        const studyTime = Math.floor((Date.now() - quizStartTime) / 1000);
        const correctAnswers = Math.round((totalScore / (questions.length * 100)) * questions.length);
        const result: QuizResult = {
          grade,
          type: 'subjective',
          score: finalScore,
          totalQuestions: questions.length,
          correctAnswers,
          date: new Date().toISOString(),
          studyTime
        };
        saveQuizResult(result);
      }
    }, []);
    
    return (
      <div className="quiz-result">
        <h1>주관식 퀴즈 완료!</h1>
        <div className="score">
          점수: {totalScore} / {questions.length * 100} ({finalScore}%)
        </div>
        <div className="actions">
          <button onClick={resetQuiz}>다시 풀기</button>
          <button onClick={() => window.location.href = `/study/${grade}`}>
            학습하기
          </button>
          <button onClick={() => window.location.href = '/'}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="error">문제를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="subjective-quiz">
      <div className="quiz-header">
        <h1>{grade} 주관식 문제</h1>
        <div className="progress">
          문제 {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="question-card">
        <div className="question">{currentQuestion.question}</div>
        
        <div className="answer-input-section">
          <div className="input-group">
            <label className="input-label">음 (소리)</label>
            <input
              type="text"
              className="answer-input"
              value={userReading}
              onChange={(e) => setUserReading(e.target.value)}
              placeholder="예: 구"
              disabled={answered}
              onKeyPress={(e) => e.key === 'Enter' && !answered && handleSubmitAnswer()}
            />
          </div>
          <div className="input-group">
            <label className="input-label">뜻 (의미)</label>
            <input
              type="text"
              className="answer-input"
              value={userMeaning}
              onChange={(e) => setUserMeaning(e.target.value)}
              placeholder="예: 입"
              disabled={answered}
              onKeyPress={(e) => e.key === 'Enter' && !answered && handleSubmitAnswer()}
            />
          </div>
          
          {!answered && (
            <button 
              className="submit-button"
              onClick={handleSubmitAnswer}
              disabled={!userReading.trim() && !userMeaning.trim()}
            >
              답안 제출
            </button>
          )}
        </div>

        {answerResult && (
          <div className={`answer-feedback ${answerResult.is_correct ? 'correct' : 'partial'}`}>
            <div className="feedback-score">점수: {answerResult.score}/100</div>
            <div className="correct-answer">정답: {currentQuestion.answer}</div>
            {answerResult.similarity && (
              <div className="similarity-info">
                유사도: {Math.round(answerResult.similarity * 100)}% - {getSimilarityMessage(answerResult.similarity)}
              </div>
            )}
            {answerResult.score > 0 && answerResult.score < 100 && (
              <div className="partial-note">유사도 검사로 부분 점수를 받았습니다!</div>
            )}
          </div>
        )}
      </div>

      <div className="navigation">
        <button 
          onClick={nextQuestion} 
          disabled={!answered}
        >
          {currentQuestionIndex === questions.length - 1 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
};

export default SubjectiveQuiz;