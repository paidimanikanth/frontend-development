import React, { useState, useEffect } from 'react';

export default function BookingModal({
  isOpen,
  onClose,
  doctorName,
  availableSlots,
  consultationFee,
  onConfirmBooking
}) {
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [setReminder, setSetReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  // Reset inputs when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPatientName('');
      setPhone('');
      setPreferredDate('');
      setSetReminder(false);
      setReminderTime('');
    }
  }, [isOpen]);

  // Set default reminder time when preferred date is selected
  useEffect(() => {
    if (preferredDate) {
      setReminderTime(`${preferredDate}T09:00`);
    }
  }, [preferredDate]);

  if (!isOpen) return null;

  const handlePatientNameChange = (e) => {
    const cleanValue = e.target.value.replace(/[^A-Za-z\s]/g, '');
    setPatientName(cleanValue);
  };

  const handlePhoneChange = (e) => {
    const cleanValue = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(cleanValue);
  };

  const handleConfirm = () => {
    const nameTrim = patientName.trim();
    if (!nameTrim || phone.length !== 10 || !preferredDate) {
      alert("Please fill in all details correctly.");
      return;
    }
    if (setReminder && !reminderTime) {
      alert("Please select a date and time for the reminder.");
      return;
    }
    onConfirmBooking(nameTrim, phone, preferredDate, setReminder ? reminderTime : null);
  };

  return (
    <div id="bookingModal" className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Book Appointment</h2>
        <p>Doctor: <strong id="selectedDoctorName">{doctorName}</strong></p>
        <p>Available Slots: <strong id="availableSlots" style={{ color: 'green' }}>{availableSlots}</strong></p>
        <p>Consultation Fee: <strong id="consultationFee" style={{ color: 'var(--primary)' }}>₹{consultationFee}</strong></p>

        <label htmlFor="patientName">Patient Name</label>
        <input
          type="text"
          id="patientName"
          placeholder="Enter your full name"
          value={patientName}
          onChange={handlePatientNameChange}
        />

        <label htmlFor="patientPhone">Phone Number</label>
        <input
          type="text"
          id="patientPhone"
          placeholder="Enter your phone number"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={handlePhoneChange}
        />

        <label htmlFor="preferredDate">Preferred Date</label>
        <input
          type="date"
          id="preferredDate"
          value={preferredDate}
          onChange={(e) => setPreferredDate(e.target.value)}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 18px 0' }}>
          <input
            type="checkbox"
            id="setReminder"
            checked={setReminder}
            onChange={(e) => setSetReminder(e.target.checked)}
            style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
          />
          <label htmlFor="setReminder" style={{ margin: 0, cursor: 'pointer', fontSize: '0.95rem' }}>
            ⏰ Set Reminder for Appointment
          </label>
        </div>

        {setReminder && (
          <div style={{ animation: 'fadeUp 0.3s ease' }}>
            <label htmlFor="reminderTime">Reminder Date & Time</label>
            <input
              type="datetime-local"
              id="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
          </div>
        )}

        <div className="modal-buttons">
          <button className="btn cancel-btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Confirm Booking</button>
        </div>
      </div>
    </div>
  );
}
