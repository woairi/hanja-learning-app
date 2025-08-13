import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hanjaApi } from '../utils/api';
import { Question, AnswerResult } from '../types';
import { saveQuizResult, QuizResult } from '../utils/storage';

const HanjaWordSubjectiveQuiz: React.FC = () => {
  const { grade } = useParams<{ grade: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
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
        const data = await hanjaApi.generateHanjaWordSubjectiveQuestions(grade, 10);
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

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion) return;

    try {
      const result = await hanjaApi.checkAnswer(userAnswer, currentQuestion.answer);
      setAnswerResult(result);
      setTotalScore(prev => prev + result.score);
      setAnswered(true);
    } catch (error) {
      console.error('답안 채점 실패:', error);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setAnswerResult(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAnswerResult(null);
    setTotalScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  const getSimilarityMessage = (similarity?: number) => {
    if (!similarity) return '';
    if (similarity >= 0.9) return '완벽합니다!';
    if (similarity >= 0.8) return '거의 정확합니다!';
    if (similarity >= 0.7) return '비슷하지만 틀렸습니다.';
    if (similarity >= 0.6) return '조금 비슷합니다.';
    return '많이 다릅니다.';
  };

  if (loading) {
    return <div className="loading">문제를 생성하고 있습니다...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="error">
        <p>해당 급수에서 사용할 수 있는 한자어가 부족합니다.</p>
        <button onClick={() => window.location.href = '/'}>홈으로</button>
      </div>
    );
  }

  if (showResult) {
    const finalScore = Math.round((totalScore / (questions.length * 100)) * 100);
    
    React.useEffect(() => {
      if (grade) {
        const studyTime = Math.floor((Date.now() - quizStartTime) / 1000);
        const correctAnswers = Math.round((totalScore / (questions.length * 100)) * questions.length);
        const result: QuizResult = {
          grade,
          type: 'hanja-word-subjective',
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
        <h1>한자어 독음 주관식 퀴즈 완료!</h1>
        <div className="score">
          점수: {totalScore} / {questions.length * 100} ({finalScore}%)
        </div>
        <div className="actions">
          <button onClick={resetQuiz}>다시 풀기</button>
          <button onClick={() => window.location.href = `/hanja-word-quiz/${grade}`}>
            객관식 문제
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
        <h1>{grade} 한자어 독음 주관식</h1>
        <div className="progress">
          문제 {currentQuestionIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="question-card">
        <div className="question">{currentQuestion.question}</div>
        
        <div className="answer-input-section">
          <input
            type="text"
            className="answer-input"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="한자어의 독음을 입력하세요 (예: 학교)"
            disabled={answered}
            onKeyPress={(e) => e.key === 'Enter' && !answered && handleSubmitAnswer()}
          />
          
          {!answered && (
            <button 
              className="submit-button"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
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

export default HanjaWordSubjectiveQuiz;