import React, { useState } from 'react';

export default function AuthPage({
  activePage,
  setActivePage,
  users,
  doctorUsers,
  onLoginSuccess,
  onSignupSuccess
}) {
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Doctor Login form state
  const [docLoginEmail, setDocLoginEmail] = useState('');
  const [docLoginPassword, setDocLoginPassword] = useState('');

  // Doctor Signup form state
  const [docSignupName, setDocSignupName] = useState('');
  const [docSignupEmail, setDocSignupEmail] = useState('');
  const [docSignupPassword, setDocSignupPassword] = useState('');
  const [docSignupConfirmPassword, setDocSignupConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (users[email] && users[email].password === password) {
      onLoginSuccess(email, 'patient', users[email].name);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      alert('Invalid email or password');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = signupName.trim();
    const email = signupEmail.trim();
    const password = signupPassword;
    const confirm = signupConfirmPassword;

    if (!name || !email || !password || !confirm) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (users[email]) {
      alert('This email is already registered');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSignupSuccess(email, { name, password }, 'patient');
      if (success) {
        alert("Registration successful! Please log in.");
        // reset form
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setActivePage('login');
      }
    } catch (err) {
      console.error("Signup error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDoctorLogin = (e) => {
    e.preventDefault();
    const email = docLoginEmail.trim();
    const password = docLoginPassword;

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    if (doctorUsers[email] && doctorUsers[email].password === password) {
      onLoginSuccess(email, 'doctor', doctorUsers[email].name);
      setDocLoginEmail('');
      setDocLoginPassword('');
    } else {
      alert('Invalid email or password');
    }
  };

  const handleDoctorSignup = async (e) => {
    e.preventDefault();
    const name = docSignupName.trim();
    const email = docSignupEmail.trim();
    const password = docSignupPassword;
    const confirm = docSignupConfirmPassword;

    if (!name || !email || !password || !confirm) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (doctorUsers[email] || users[email]) {
      alert('This email is already registered');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSignupSuccess(email, { name, password }, 'doctor');
      if (success) {
        alert("Registration successful! Please log in.");
        // reset form
        setDocSignupName('');
        setDocSignupEmail('');
        setDocSignupPassword('');
        setDocSignupConfirmPassword('');
        setActivePage('doctorLogin');
      }
    } catch (err) {
      console.error("Doctor signup error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Patient Login */}
      {activePage === 'login' && (
        <div id="loginPage" className="auth-page active">
          <div className="auth-container">
            <div className="auth-card">
              <h1 className="auth-title">Welcome Doctor Appointment</h1>
              <p className="auth-subtitle">Please Log in to your account</p>
              <form id="loginForm" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="loginEmail" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="loginEmail"
                    className="form-input"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="loginPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    className="form-input"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Login</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setActivePage('signup')}>Sign up</button>
                </div>
              </form>
              <div className="portal-switch" style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActivePage('doctorLogin'); }}
                  style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  Are you a Doctor? Doctor Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Sign Up */}
      {activePage === 'signup' && (
        <div id="signupPage" className="auth-page active">
          <div className="auth-container">
            <div className="auth-card">
              <h1 className="auth-title">Create Account</h1>
              <p className="auth-subtitle">Join us to book your appointments.</p>
              <form id="signupForm" onSubmit={handleSignup}>
                <div className="form-group">
                  <label htmlFor="signupName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="signupName"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="signupEmail"
                    className="form-input"
                    placeholder="Enter your email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    id="signupPassword"
                    className="form-input"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupConfirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="signupConfirmPassword"
                    className="form-input"
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Registering...' : 'Sign up'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setActivePage('login')} disabled={isSubmitting}>Back to Login</button>
                </div>
              </form>
              <div className="portal-switch" style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActivePage('doctorLogin'); }}
                  style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  Are you a Doctor? Doctor Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Login */}
      {activePage === 'doctorLogin' && (
        <div id="doctorLoginPage" className="auth-page active">
          <div className="auth-container">
            <div className="auth-card" style={{ borderTop: '5px solid var(--accent)' }}>
              <h1 className="auth-title">Doctor Portal</h1>
              <p className="auth-subtitle">Log in to manage your profile</p>
              <form id="doctorLoginForm" onSubmit={handleDoctorLogin}>
                <div className="form-group">
                  <label htmlFor="doctorLoginEmail" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="doctorLoginEmail"
                    className="form-input"
                    placeholder="Enter your email"
                    value={docLoginEmail}
                    onChange={(e) => setDocLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorLoginPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    id="doctorLoginPassword"
                    className="form-input"
                    placeholder="Enter your password"
                    value={docLoginPassword}
                    onChange={(e) => setDocLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    Login
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setActivePage('doctorSignup')}>Sign up</button>
                </div>
              </form>
              <div className="portal-switch" style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActivePage('login'); }}
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  Are you a Patient? Patient Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Sign Up */}
      {activePage === 'doctorSignup' && (
        <div id="doctorSignupPage" className="auth-page active">
          <div className="auth-container">
            <div className="auth-card" style={{ borderTop: '5px solid var(--accent)' }}>
              <h1 className="auth-title">Doctor Registration</h1>
              <p className="auth-subtitle">Create your professional account</p>
              <form id="doctorSignupForm" onSubmit={handleDoctorSignup}>
                <div className="form-group">
                  <label htmlFor="doctorSignupName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="doctorSignupName"
                    className="form-input"
                    placeholder="Enter your full name (e.g. Dr. Jane Smith)"
                    value={docSignupName}
                    onChange={(e) => setDocSignupName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorSignupEmail" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="doctorSignupEmail"
                    className="form-input"
                    placeholder="Enter your email"
                    value={docSignupEmail}
                    onChange={(e) => setDocSignupEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorSignupPassword" className="form-label">Password</label>
                  <input
                    type="password"
                    id="doctorSignupPassword"
                    className="form-input"
                    placeholder="Create a password"
                    value={docSignupPassword}
                    onChange={(e) => setDocSignupPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="doctorSignupConfirmPassword" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    id="doctorSignupConfirmPassword"
                    className="form-input"
                    placeholder="Confirm your password"
                    value={docSignupConfirmPassword}
                    onChange={(e) => setDocSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {isSubmitting ? 'Registering...' : 'Sign up'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setActivePage('doctorLogin')} disabled={isSubmitting}>Back to Login</button>
                </div>
              </form>
              <div className="portal-switch" style={{ textAlign: 'center', marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setActivePage('login'); }}
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem' }}
                >
                  Are you a Patient? Patient Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
