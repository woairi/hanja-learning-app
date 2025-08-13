import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Study from './pages/Study';
import Quiz from './pages/Quiz';
import SubjectiveQuiz from './pages/SubjectiveQuiz';
import HanjaWordQuiz from './pages/HanjaWordQuiz';
import HanjaWordSubjectiveQuiz from './pages/HanjaWordSubjectiveQuiz';
import Stats from './pages/Stats';
import Review from './pages/Review';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/study/:grade" element={<Study />} />
          <Route path="/quiz/:grade" element={<Quiz />} />
          <Route path="/subjective-quiz/:grade" element={<SubjectiveQuiz />} />
          <Route path="/hanja-word-quiz/:grade" element={<HanjaWordQuiz />} />
          <Route path="/hanja-word-subjective-quiz/:grade" element={<HanjaWordSubjectiveQuiz />} />
          <Route path="/review/:grade" element={<Review />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;