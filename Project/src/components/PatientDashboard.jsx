import React, { useState } from 'react';

export default function PatientDashboard({
  currentUser,
  users,
  onLogout,
  hardcodedDoctors,
  customDoctors,
  feedbackData,
  openBookingModal,
  openFeedbackModal,
  onCancelAppointment,
  onSetReminder,
  onRemoveReminder
}) {
  const userObj = users[currentUser] || {};
  const name = userObj.name || currentUser.split('@')[0];

  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'doctors' | 'history' | 'feedbackHistory'
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [editingReminderBookedAt, setEditingReminderBookedAt] = useState(null);
  const [tempReminderTime, setTempReminderTime] = useState('');

  const formatReminderTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDefaultReminderTime = (dmyDate) => {
    if (!dmyDate) return '';
    const [dd, mm, yyyy] = dmyDate.split('-');
    return `${yyyy}-${mm}-${dd}T09:00`;
  };

  // Filter doctors based on selected criteria
  const getMatchingDoctors = () => {
    if (!selectedSpecialty || !selectedPlace) return [];

    const hardcodedMatches = hardcodedDoctors.filter(
      (doc) => doc.specialty === selectedSpecialty && doc.place === selectedPlace
    );
    const customMatches = customDoctors.filter(
      (doc) => doc.specialty === selectedSpecialty && doc.place === selectedPlace
    );

    // Combine them
    const allMatches = [...hardcodedMatches, ...customMatches];
    return allMatches;
  };

  const handleSearchSubmit = () => {
    if (!selectedSpecialty || !selectedPlace) {
      alert('Please select both Doctor Type and Place.');
      return;
    }
    setHasSearched(true);
    setActiveTab('doctors');
  };

  const renderFeedbackStars = (ratingVal) => {
    return '★'.repeat(ratingVal) + '☆'.repeat(5 - ratingVal);
  };

  const matchingDoctors = getMatchingDoctors();
  const bookingHistory = userObj.history || [];
  const feedbackHistory = userObj.feedbacks || [];

  return (
    <div id="appointmentPage" className="auth-page appointment-layout active">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="sidebar-text">
            <h1 className="sidebar-title" id="welcomeMessage">
              Welcome, {name}
            </h1>
            <p className="sidebar-subtitle">Search for the best doctors here.</p>
          </div>
          <div className="sidebar-footer">
            <button className="btn btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Tab Bar */}
        <div className="tab-bar">
          <button
            id="tabInfo"
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Search
          </button>
          <button
            id="tabDoctors"
            className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
            onClick={() => setActiveTab('doctors')}
          >
            Doctors List
          </button>
          <button
            id="tabHistory"
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Booking History
          </button>
          <button
            id="tabFeedbackHistory"
            className={`tab-btn ${activeTab === 'feedbackHistory' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedbackHistory')}
          >
            Feedback History
          </button>
        </div>

        {/* Tab content: Search */}
        {activeTab === 'info' && (
          <div id="tabContentInfo" className="tab-content-area">
            <div className="Information-box">
              <h2>Find a Specialist</h2>
              <label htmlFor="doctor">Doctor Type</label>
              <select
                id="doctor"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">-- Select Specialist --</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="orthopedic Surgeon">Orthopedic Surgeon</option>
                <option value="gynecologist">Gynecologist</option>
                <option value="Nephrologist">Nephrologist</option>
                <option value="Endocrinologist">Endocrinologist</option>
                <option value="Otolaryngologist">Otolaryngologist</option>
                <option value="General Surgeon">General Surgeon</option>
              </select>

              <label htmlFor="place">Place</label>
              <select
                id="place"
                value={selectedPlace}
                onChange={(e) => setSelectedPlace(e.target.value)}
              >
                <option value="">-- Select Place --</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Secunderabad">Secunderabad</option>
                <option value="Medchal-Malkajgiri">Medchal-Malkajgiri</option>
                <option value="Patancheruvu">Patancheruvu</option>
                <option value="Rangareddy">Rangareddy</option>
                <option value="warangal">Warangal</option>
                <option value="Sangareddy">Sangareddy</option>
                <option value="Kariminagar">Karimnagar</option>
                <option value="Siddipet">Siddipet</option>
                <option value="Sircilla">Sircilla</option>
              </select>

              <button
                id="submitBtn"
                onClick={handleSearchSubmit}
                disabled={!selectedSpecialty || !selectedPlace}
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Tab content: Doctors List */}
        {activeTab === 'doctors' && (
          <div id="tabContentDoctors" className="tab-content-area">
            <div id="result">
              {!hasSearched ? (
                <p>Please perform a search first to view available doctors.</p>
              ) : matchingDoctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <h2 style={{ color: 'var(--danger)' }}>No Doctor Available</h2>
                  <p>
                    Sorry, we currently do not have {selectedSpecialty} doctors in {selectedPlace}. Please go back and try searching in nearby areas.
                  </p>
                </div>
              ) : (
                matchingDoctors.map((doc) => {
                  const docFeedbacks = feedbackData[doc.name] || [];
                  const isNotAvailable = doc.status?.trim() === 'Not Available' || doc.slots === 0;
                  const statusIcon = doc.status?.trim() === 'Not Available' ? '🔴' : '🟢';

                  return (
                    <div className="doctor-card" key={doc.name}>
                      <img src={doc.image} className="doctor-img" alt={doc.name} />
                      <h3>{doc.name}</h3>
                      <p><strong>Hospital:</strong> {doc.hospital}</p>
                      <img src={doc.hospitalImage} className="hospital-img" alt={doc.hospital} />
                      <p><strong>Rating:</strong> {doc.rating}</p>
                      {doc.suggestion && <p><strong>Suggestion:</strong> "{doc.suggestion}"</p>}
                      <p><strong>Available Time:</strong> {doc.timing}</p>
                      <p><strong>Location:</strong> {doc.location}</p>
                      <p><strong>Consultation Fee:</strong> ₹{(doc.consultationFee && doc.consultationFee !== '--') ? doc.consultationFee : 500}</p>
                      <div className="status">
                        <span style={{ fontSize: '1.3rem' }}>{statusIcon}</span>
                        <span>{doc.status || 'Available'}</span>
                      </div>
                      <div className="slots">Available Slots: {doc.slots ?? 10}</div>


                      <button
                        className="book-btn"
                        disabled={isNotAvailable}
                        onClick={() => openBookingModal(doc.name)}
                      >
                        Book Appointment
                      </button>

                      <button
                        className="feedback-btn"
                        onClick={() => openFeedbackModal(doc.name)}
                      >
                        Give Feedback
                      </button>

                      {/* Feedbacks list */}
                      <div className="feedback-list">
                        <h4>📝 Feedback ({docFeedbacks.length})</h4>
                        {docFeedbacks.length === 0 ? (
                          <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#64748b' }}>No feedback yet.</p>
                        ) : (
                          docFeedbacks.map((fb, idx) => (
                            <div className="feedback-item" key={idx}>
                              <div className="fb-stars">{renderFeedbackStars(fb.rating)}</div>
                              <p className="fb-text">"{fb.text}"</p>
                              <span className="fb-author">— {fb.name} | {fb.date}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab content: Booking History */}
        {activeTab === 'history' && (
          <div id="tabContentHistory" className="tab-content-area">
            <div className="Information-box" style={{ maxWidth: '800px' }}>
              <h2>Your Booking History</h2>
              <div id="historyResult">
                {bookingHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>No booking history found.</p>
                  </div>
                ) : (
                  [...bookingHistory].reverse().map((booking, index) => (
                    <div className="doctor-card" style={{ marginBottom: '15px', padding: '20px', width: '100%', maxWidth: '100%' }} key={index}>
                      <h3 style={{ marginTop: 0 }}>Appointment with {booking.doctor}</h3>
                      <p style={{ margin: '4px 0' }}><strong>Patient:</strong> {booking.patientName}</p>
                      <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {booking.phone}</p>
                      <p style={{ margin: '4px 0' }}><strong>Date:</strong> {booking.date}</p>
                      <p style={{ margin: '4px 0' }}><strong>Consultation Fee:</strong> ₹{(booking.consultationFee && booking.consultationFee !== '--') ? booking.consultationFee : 500}</p>

                      
                      {/* Reminder Section */}
                      <div style={{
                        marginTop: '16px',
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        width: '100%',
                        fontSize: '0.9rem'
                      }}>
                        {editingReminderBookedAt === booking.bookedAt ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor={`rem-time-${index}`} style={{ margin: 0, fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                              Set Reminder Date & Time:
                            </label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input
                                type="datetime-local"
                                id={`rem-time-${index}`}
                                value={tempReminderTime}
                                onChange={(e) => setTempReminderTime(e.target.value)}
                                style={{
                                  padding: '8px 12px',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '0.85rem',
                                  fontFamily: 'Inter, sans-serif',
                                  margin: 0,
                                  flex: '1',
                                  minWidth: '180px'
                                }}
                              />
                              <button
                                className="btn btn-primary"
                                style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', flex: 'none', borderRadius: '6px', height: 'auto', margin: 0 }}
                                onClick={() => {
                                  if (!tempReminderTime) {
                                    alert('Please select a reminder time.');
                                    return;
                                  }
                                  onSetReminder(booking.bookedAt, tempReminderTime);
                                  setEditingReminderBookedAt(null);
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', flex: 'none', borderRadius: '6px', height: 'auto', margin: 0 }}
                                onClick={() => setEditingReminderBookedAt(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : booking.reminderTime ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                ⏰ Reminder:
                              </span>{' '}
                              <span style={{ color: 'var(--text-muted)' }}>
                                {formatReminderTime(booking.reminderTime)}
                              </span>
                              {booking.reminderStatus === 'triggered' && (
                                <span style={{
                                  marginLeft: '8px',
                                  fontSize: '0.75rem',
                                  background: 'var(--primary-light)',
                                  color: 'var(--primary)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontWeight: '600'
                                }}>
                                  Triggered
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', flex: 'none', borderRadius: '6px', height: 'auto', margin: 0 }}
                                onClick={() => {
                                  setEditingReminderBookedAt(booking.bookedAt);
                                  setTempReminderTime(booking.reminderTime);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn cancel-btn"
                                style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', flex: 'none', borderRadius: '6px', height: 'auto', margin: 0 }}
                                onClick={() => onRemoveReminder(booking.bookedAt)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <button
                              className="btn btn-primary"
                              style={{
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                width: 'auto',
                                flex: 'none',
                                borderRadius: '6px',
                                height: 'auto',
                                margin: 0,
                                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                                boxShadow: 'none'
                              }}
                              onClick={() => {
                                setEditingReminderBookedAt(booking.bookedAt);
                                setTempReminderTime(getDefaultReminderTime(booking.date));
                              }}
                            >
                              ⏰ Set Reminder
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        className="btn cancel-btn"
                        onClick={() => onCancelAppointment(booking.bookedAt)}
                        style={{ marginTop: '16px', padding: '8px 16px', width: 'auto', fontSize: '0.9rem', borderRadius: '8px' }}
                      >
                        Cancel Appointment
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab content: Feedback History */}
        {activeTab === 'feedbackHistory' && (
          <div id="tabContentFeedbackHistory" className="tab-content-area">
            <div className="Information-box" style={{ maxWidth: '800px' }}>
              <h2>Your Feedback History</h2>
              <div id="feedbackHistoryResult">
                {feedbackHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <p>No feedback history found.</p>
                  </div>
                ) : (
                  [...feedbackHistory].reverse().map((fb, index) => (
                    <div className="feedback-item" style={{ marginBottom: '15px', padding: '20px', width: '100%', maxWidth: '100%', borderLeft: '4px solid var(--accent)' }} key={index}>
                      <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.1rem' }}>Feedback for {fb.doctor}</h3>
                      <div className="fb-stars" style={{ color: '#f59e0b', fontSize: '1.2rem', margin: '8px 0' }}>
                        {renderFeedbackStars(fb.rating)}
                      </div>
                      <p className="fb-text" style={{ fontStyle: 'italic', color: '#334155' }}>"{fb.text}"</p>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '12px', marginBottom: 0 }}>
                        Submitted on: {new Date(fb.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
