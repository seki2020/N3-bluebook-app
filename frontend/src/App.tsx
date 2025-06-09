import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import N3Page from './pages/N3Page'; // Import the N3Page component
import QuizPage from './pages/QuizPage'; // Import the QuizPage component

function HomePage() {
  const [email, setEmail] = useState('');
  const [wechat, setWechat] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [messageColor, setMessageColor] = useState('');
  const navigate = useNavigate();

  const handleN3Click = () => {
    navigate('/n3'); // Use navigate for React Router
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage(''); // Clear previous message

    try {
      const response = await fetch('/api/submit-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, wechat }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessageColor('green');
        setFormMessage('感谢您的提交！我们已收到您的信息。');
        setEmail('');
        setWechat('');
      } else {
        setMessageColor('red');
        setFormMessage(result.message || '提交失败，请重试。');
      }
    } catch (error) {
      setMessageColor('red');
      setFormMessage('网络错误，请检查您的连接。');
      console.error('Error:', error);
    }
  };

  return (
    <>
      <h1>蓝宝书随身练</h1>

      <div className="jlpt-buttons">
        <div className="jlpt-button-group">
          <button className="jlpt-button" id="n1-button" disabled>JLPT N1</button>
          <div className="coming-soon">即将开放，尽情期待</div>
        </div>
        <div className="jlpt-button-group">
          <button className="jlpt-button" id="n2-button" disabled>JLPT N2</button>
          <div className="coming-soon">即将开放，尽情期待</div>
        </div>
        <div className="jlpt-button-group">
          <button className="jlpt-button" id="n3-button" onClick={handleN3Click}>JLPT N3</button>
        </div>
        <div className="jlpt-button-group">
          <button className="jlpt-button" id="n4-button" disabled>JLPT N4</button>
          <div className="coming-soon">即将开放，尽情期待</div>
        </div>
        <div className="jlpt-button-group">
          <button className="jlpt-button" id="n5-button" disabled>JLPT N5</button>
          <div className="coming-soon">即将开放，尽情期待</div>
        </div>
      </div>

      <div className="hero-section">
        <h2>获取最新更新和独家AI过关秘笈！</h2>
        <p>留下您的邮箱或微信号，我们将第一时间通知您新功能上线和学习资料更新。</p>
        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="您的邮箱"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            id="wechat"
            name="wechat"
            placeholder="您的微信号 (可选)"
            value={wechat}
            onChange={(e) => setWechat(e.target.value)}
          />
          <button type="submit">发送</button>
        </form>
        {formMessage && <div id="form-message" style={{ color: messageColor }}>{formMessage}</div>}
      </div>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/n3" element={<N3Page />} />
      <Route path="/quiz/:chNo" element={<QuizPage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;
