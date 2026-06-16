import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import BookingModal from './components/BookingModal';
import FeedbackModal from './components/FeedbackModal';
import {
  initializeDatabase,
  fetchDoctors,
  fetchUsers,
  fetchDoctorUsers,
  fetchFeedbacks,
  registerUser,
  saveDoctorProfile,
  bookAppointment,
  cancelAppointment,
  submitFeedback,
  setReminder,
  removeReminder,
  updateReminderStatus
} from './firebaseService';

export default function App() {
  // --- Persistent States ---
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [doctorUsers, setDoctorUsers] = useState({});
  const [allDoctors, setAllDoctors] = useState([]);
  const [feedbackData, setFeedbackData] = useState({});

  // --- Session States ---
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('loggedInUser') || null;
  });

  const [userType, setUserType] = useState(() => {
    return localStorage.getItem('loggedInUserType') || null;
  });

  const [activePage, setActivePage] = useState(() => {
    const user = localStorage.getItem('loggedInUser');
    const type = localStorage.getItem('loggedInUserType');
    if (user && type === 'patient') return 'appointment';
    if (user && type === 'doctor') return 'doctorDashboard';
    return 'login';
  });

  // --- Modals State ---
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorName, setSelectedDoctorName] = useState('');

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [currentFeedbackDoctorName, setCurrentFeedbackDoctorName] = useState('');

  const [activeReminders, setActiveReminders] = useState([]);

  // --- Initialize Database & Fetch Data ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await initializeDatabase();
        const [u, du, docs, fbs] = await Promise.all([
          fetchUsers(),
          fetchDoctorUsers(),
          fetchDoctors(),
          fetchFeedbacks()
        ]);
        setUsers(u);
        setDoctorUsers(du);
        setAllDoctors(docs);
        setFeedbackData(fbs);
      } catch (error) {
        console.error("Failed to load initial data from DB:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- Auth Actions ---
  const handleLoginSuccess = (email, type) => {
    setCurrentUser(email);
    setUserType(type);
    localStorage.setItem('loggedInUser', email);
    localStorage.setItem('loggedInUserType', type);
    if (type === 'patient') {
      setActivePage('appointment');
    } else {
      setActivePage('doctorDashboard');
    }
  };

  const handleSignupSuccess = async (email, userObj, type) => {
    try {
      const updatedUsers = await registerUser(email, userObj, type);
      if (type === 'patient') {
        setUsers(updatedUsers);
      } else {
        setDoctorUsers(updatedUsers);
      }
      return true;
    } catch (error) {
      alert("Sign up registration failed: " + error.message);
      return false;
    }
  };

  const handleLogout = (confirm = true) => {
    const shouldConfirm = typeof confirm === 'boolean' ? confirm : true;
    if (!shouldConfirm || window.confirm('Are you sure you want to logout?')) {
      const isDoctor = userType === 'doctor';
      setCurrentUser(null);
      setUserType(null);
      setActiveReminders([]);
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('loggedInUserType');
      setActivePage(isDoctor ? 'doctorLogin' : 'login');
    }
  };

  // --- Doctor Dashboard Actions ---
  const handleSaveDoctorProfile = async (profileData) => {
    try {
      const updatedDocs = await saveDoctorProfile(currentUser, profileData);
      setAllDoctors(updatedDocs);
      alert('Profile saved successfully! Patients can now find you under ' + profileData.specialty + ' in ' + profileData.place + '.');
    } catch (error) {
      alert("Failed to save doctor profile: " + error.message);
    }
  };

  // --- Booking Actions ---
  const handleOpenBookingModal = (doctorName) => {
    setSelectedDoctorName(doctorName);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (patientName, phone, date, reminderTime) => {
    try {
      const res = await bookAppointment(
        currentUser,
        selectedDoctorName,
        patientName,
        phone,
        date,
        reminderTime
      );
      setUsers(res.users);
      setAllDoctors(res.doctors);
      setBookingModalOpen(false);
    } catch (error) {
      alert("Booking failed: " + error.message);
    }
  };

  const handleSetReminder = async (bookedAt, reminderTime) => {
    try {
      const updatedUsers = await setReminder(currentUser, bookedAt, reminderTime);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to set reminder: ", error);
    }
  };

  const handleRemoveReminder = async (bookedAt) => {
    try {
      const updatedUsers = await removeReminder(currentUser, bookedAt);
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Failed to remove reminder: ", error);
    }
  };

  const handleDismissReminder = (bookedAt) => {
    setActiveReminders(prev => prev.filter(r => r.bookedAt !== bookedAt));
  };

  // --- Background Reminder Checker ---
  useEffect(() => {
    if (currentUser && userType === 'patient' && users[currentUser]) {
      const interval = setInterval(async () => {
        const history = users[currentUser].history || [];
        const now = new Date();
        const newTriggered = [];

        for (const booking of history) {
          if (booking.reminderTime && booking.reminderStatus === 'pending') {
            const remTime = new Date(booking.reminderTime);
            if (now >= remTime) {
              newTriggered.push(booking);
              try {
                const updatedUsers = await updateReminderStatus(currentUser, booking.bookedAt, 'triggered');
                setUsers(updatedUsers);
              } catch (error) {
                console.error("Failed to update reminder status: ", error);
              }
            }
          }
        }

        if (newTriggered.length > 0) {
          setActiveReminders(prev => [...prev, ...newTriggered]);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentUser, userType, users]);

  const handleCancelAppointment = async (bookedAt) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const res = await cancelAppointment(currentUser, bookedAt);
        setUsers(res.users);
        setAllDoctors(res.doctors);
        alert("Appointment cancelled successfully.");
      } catch (error) {
        alert("Failed to cancel appointment: " + error.message);
      }
    }
  };

  // --- Feedback Actions ---
  const handleOpenFeedbackModal = (doctorName) => {
    setCurrentFeedbackDoctorName(doctorName);
    setFeedbackModalOpen(true);
  };

  const handleConfirmFeedback = async (name, rating, text) => {
    try {
      const res = await submitFeedback(currentUser, currentFeedbackDoctorName, name, rating, text);
      setFeedbackData(res.feedbacks);
      setUsers(res.users);
      alert("Thank you for your feedback!");
      setFeedbackModalOpen(false);
    } catch (error) {
      alert("Failed to submit feedback: " + error.message);
    }
  };

  const customDoctors = allDoctors.filter(doc => doc.email);
  const hardcodedDoctorsList = allDoctors.filter(doc => !doc.email);

  const activeDoctor = selectedDoctorName
    ? allDoctors.find(d => d.name === selectedDoctorName)
    : null;
  const activeBookingSlots = activeDoctor?.slots ?? 0;
  const activeBookingFee = (activeDoctor?.consultationFee && activeDoctor?.consultationFee !== '--') ? activeDoctor.consultationFee : 500;

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>Initializing database...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Pages rendering based on activePage */}
      {['login', 'signup', 'doctorLogin', 'doctorSignup'].includes(activePage) && (
        <AuthPage
          activePage={activePage}
          setActivePage={setActivePage}
          users={users}
          doctorUsers={doctorUsers}
          onLoginSuccess={handleLoginSuccess}
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      {activePage === 'doctorDashboard' && currentUser && (
        <DoctorDashboard
          currentUser={currentUser}
          doctorUsers={doctorUsers}
          customDoctors={customDoctors}
          onSaveProfile={handleSaveDoctorProfile}
          onLogout={handleLogout}
        />
      )}

      {activePage === 'appointment' && currentUser && (
        <PatientDashboard
          currentUser={currentUser}
          users={users}
          onLogout={handleLogout}
          hardcodedDoctors={hardcodedDoctorsList}
          customDoctors={customDoctors}
          feedbackData={feedbackData}
          openBookingModal={handleOpenBookingModal}
          openFeedbackModal={handleOpenFeedbackModal}
          onCancelAppointment={handleCancelAppointment}
          onSetReminder={handleSetReminder}
          onRemoveReminder={handleRemoveReminder}
        />
      )}

      {/* Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        doctorName={selectedDoctorName}
        availableSlots={activeBookingSlots}
        consultationFee={activeBookingFee}
        onConfirmBooking={handleConfirmBooking}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        doctorName={currentFeedbackDoctorName}
        onSubmitFeedback={handleConfirmFeedback}
      />

      {/* Floating Reminders */}
      {activeReminders.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '360px',
          width: '100%'
        }}>
          {activeReminders.map((rem, idx) => (
            <div key={idx} style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
              borderLeft: '5px solid #f59e0b',
              position: 'relative',
              animation: 'fadeUp 0.3s ease',
            }}>
              <button
                onClick={() => handleDismissReminder(rem.bookedAt)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
              >
                &times;
              </button>
              <h4 style={{ margin: '0 0 6px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.05rem', fontWeight: '700' }}>
                ⏰ Appointment Reminder
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.4', color: '#cbd5e1' }}>
                You have an upcoming appointment with <strong>{rem.doctor}</strong> for <strong>{rem.patientName}</strong> on <strong>{rem.date}</strong>.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
