import React, { useState, useEffect } from 'react';

export default function FeedbackModal({
  isOpen,
  onClose,
  doctorName,
  onSubmitFeedback
}) {
  const [feedbackName, setFeedbackName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFeedbackName('');
      setRating(0);
      setHoverRating(0);
      setFeedbackText('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e) => {
    const cleanValue = e.target.value.replace(/[^A-Za-z\s]/g, '');
    setFeedbackName(cleanValue);
  };

  const handleSubmit = () => {
    const nameTrim = feedbackName.trim();
    const textTrim = feedbackText.trim();

    if (!nameTrim) {
      alert("Please enter your name.");
      return;
    }
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }
    if (!textTrim) {
      alert("Please write your feedback.");
      return;
    }

    onSubmitFeedback(nameTrim, rating, textTrim);
  };

  return (
    <div id="feedbackModal" className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Feedback</h2>
        <p>Doctor: <strong id="feedbackDoctorName">{doctorName}</strong></p>

        <label htmlFor="feedbackName">Your Name</label>
        <input
          type="text"
          id="feedbackName"
          placeholder="Enter your name"
          value={feedbackName}
          onChange={handleNameChange}
        />

        <label>Rating</label>
        <div className="star-rating" id="starRating">
          {[1, 2, 3, 4, 5].map((val) => {
            const isSelected = val <= (hoverRating || rating);
            return (
              <span
                key={val}
                className={`star ${val <= rating ? 'selected' : ''}`}
                style={{ color: isSelected ? '#f59e0b' : '#cbd5e1' }}
                onClick={() => setRating(val)}
                onMouseOver={() => setHoverRating(val)}
                onMouseOut={() => setHoverRating(0)}
              >
                &#9733;
              </span>
            );
          })}
        </div>

        <label htmlFor="feedbackText">Your Feedback</label>
        <textarea
          id="feedbackText"
          className="feedback-textarea"
          placeholder="Share your experience with this doctor..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
        />

        <div className="modal-buttons">
          <button className="btn cancel-btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit Feedback</button>
        </div>
      </div>
    </div>
  );
}
