import React, { useState, useEffect } from 'react';

export default function DoctorDashboard({
  currentUser,
  doctorUsers,
  customDoctors,
  onSaveProfile,
  onLogout
}) {
  const doctorObj = doctorUsers[currentUser] || {};
  const docNameFromUser = doctorObj.name || currentUser.split('@')[0];

  // Form states
  const [docName, setDocName] = useState(docNameFromUser);
  const [hospital, setHospital] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [place, setPlace] = useState('');
  const [timing, setTiming] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');
  const [hospitalImage, setHospitalImage] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  // Load existing profile details
  useEffect(() => {
    const existingDoc = customDoctors.find(doc => doc.email === currentUser);
    if (existingDoc) {
      setDocName(existingDoc.name || docNameFromUser);
      setHospital(existingDoc.hospital || '');
      setSpecialty(existingDoc.specialty || '');
      setPlace(existingDoc.place || '');
      setTiming(existingDoc.timing || '');
      setLocation(existingDoc.location || '');
      setImage(existingDoc.image === 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu83J9kqtU2g72BIhD68RHSeSP77OycSCb0OWdehR5gw&s' ? '' : existingDoc.image || '');
      setHospitalImage(existingDoc.hospitalImage === 'https://www.shutterstock.com/image-vector/hospital-building-icon-healthcare-medical-260nw-2114681609.jpg' ? '' : existingDoc.hospitalImage || '');
      setConsultationFee(existingDoc.consultationFee !== undefined ? existingDoc.consultationFee : '');
    } else {
      setDocName(docNameFromUser);
      setConsultationFee('');
    }
  }, [currentUser, customDoctors, docNameFromUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const nameTrim = docName.trim();
    const hospitalTrim = hospital.trim();
    const timingTrim = timing.trim();
    const locationTrim = location.trim();
    const feeNum = Number(consultationFee);

    if (!nameTrim || !hospitalTrim || !specialty || !place || !timingTrim || !locationTrim || !consultationFee) {
      alert('Please fill in all required fields');
      return;
    }

    if (isNaN(feeNum) || feeNum <= 0) {
      alert('Please enter a valid positive consultation fee');
      return;
    }

    const defaultImg = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRu83J9kqtU2g72BIhD68RHSeSP77OycSCb0OWdehR5gw&s';
    const defaultHospitalImg = 'https://www.shutterstock.com/image-vector/hospital-building-icon-healthcare-medical-260nw-2114681609.jpg';

    const finalImage = image.trim() || defaultImg;
    const finalHospitalImage = hospitalImage.trim() || defaultHospitalImg;

    onSaveProfile({
      email: currentUser,
      name: nameTrim,
      hospital: hospitalTrim,
      specialty,
      place,
      timing: timingTrim,
      location: locationTrim,
      image: finalImage,
      hospitalImage: finalHospitalImage,
      consultationFee: feeNum
    });
  };

  return (
    <div id="doctorDashboardPage" className="auth-page appointment-layout active">
      <div
        className="sidebar"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          borderBottom: '4px solid var(--accent)'
        }}
      >
        <div className="sidebar-content">
          <div className="sidebar-text">
            <h1 className="sidebar-title" id="doctorWelcomeMessage">
              Welcome, {docNameFromUser}
            </h1>
            <p className="sidebar-subtitle">Manage your profile and registration details here.</p>
          </div>
          <div className="sidebar-footer">
            <button className="btn btn-back" onClick={() => onLogout(false)}>
              Back
            </button>
            <button className="btn btn-logout" onClick={() => onLogout(true)}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="tab-content-area">
          <div className="Information-box">
            <div style={{ marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>Your Professional Profile</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Please enter or update your details. These will be visible to patients looking for a specialist.
            </p>
            <form id="doctorProfileForm" onSubmit={handleSubmit}>
              <label htmlFor="docProfileName">Doctor Name</label>
              <input
                type="text"
                id="docProfileName"
                className="form-input"
                placeholder="e.g. Dr. John Doe"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                style={{ marginBottom: '22px' }}
              />

              <label htmlFor="docProfileHospital">Hospital Name</label>
              <input
                type="text"
                id="docProfileHospital"
                className="form-input"
                placeholder="e.g. Apollo Hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                required
                style={{ marginBottom: '22px' }}
              />

              <label htmlFor="docProfileSpecialty">Specialty</label>
              <select
                id="docProfileSpecialty"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                required
                style={{
                  marginBottom: '22px',
                  width: '100%',
                  padding: '14px 14px',
                  border: '2px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontFamily: "'Inter', sans-serif"
                }}
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

              <label htmlFor="docProfilePlace">Place</label>
              <select
                id="docProfilePlace"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                required
                style={{
                  marginBottom: '22px',
                  width: '100%',
                  padding: '14px 14px',
                  border: '2px solid #cbd5e1',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontFamily: "'Inter', sans-serif"
                }}
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

              <label htmlFor="docProfileTiming">Timing</label>
              <input
                type="text"
                id="docProfileTiming"
                className="form-input"
                placeholder="e.g. 9:00 AM - 1:00 PM"
                value={timing}
                onChange={(e) => setTiming(e.target.value)}
                required
                style={{ marginBottom: '22px' }}
              />

              <label htmlFor="docProfileLocation">Location (Full Address)</label>
              <input
                type="text"
                id="docProfileLocation"
                className="form-input"
                placeholder="Full address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                style={{ marginBottom: '22px' }}
              />

              <label htmlFor="docProfileFee">Consultation Fee (₹)</label>
              <input
                type="number"
                id="docProfileFee"
                className="form-input"
                placeholder="e.g. 500"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                required
                min="0"
                step="50"
                style={{ marginBottom: '22px' }}
              />

              <label htmlFor="docProfileImage">Photo URL (Optional)</label>
              <input
                type="url"
                id="docProfileImage"
                className="form-input"
                placeholder="https://example.com/photo.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ marginBottom: '22px' }}
              />

              <label htmlFor="docProfileHospitalImage">Hospital Photo URL (Optional)</label>
              <input
                type="url"
                id="docProfileHospitalImage"
                className="form-input"
                placeholder="https://example.com/hospital.jpg"
                value={hospitalImage}
                onChange={(e) => setHospitalImage(e.target.value)}
                style={{ marginBottom: '22px' }}
              />

              <button
                id="docProfileSubmitBtn"
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                }}
              >
                Save Profile Details
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
