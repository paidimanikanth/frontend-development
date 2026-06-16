import { db, useLocalStorageFallback } from './firebase';
import { hardcodedDoctors } from './doctorsData';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  writeBatch 
} from 'firebase/firestore';

// Helper to find a doctor's document ref by their name field (since seeded docs are named and custom docs are email keys)
const findDoctorDocRefByName = async (doctorName) => {
  if (useLocalStorageFallback) return null;
  // Try doc with ID as name first (common for seeded doctors)
  const refByName = doc(db, 'doctors', doctorName);
  const snapByName = await getDoc(refByName);
  if (snapByName.exists()) {
    return refByName;
  }
  // Search doctors where name field matches doctorName
  const qSnapshot = await getDocs(collection(db, 'doctors'));
  let foundRef = null;
  qSnapshot.forEach((docSnap) => {
    if (docSnap.data().name === doctorName) {
      foundRef = doc(db, 'doctors', docSnap.id);
    }
  });
  return foundRef;
};

// Initialize DB: seed initial doctors if empty (or setup LocalStorage fallbacks)
export const initializeDatabase = async () => {
  if (useLocalStorageFallback) {
    console.log("[Firebase Fallback] Ensuring localStorage database tables exist.");
    
    // Auto-migrate from old local storage keys if they exist and the new database tables are empty/missing
    const oldUsersStr = localStorage.getItem('users');
    const dbUsersStr = localStorage.getItem('db_users');
    let dbUsers = {};
    try {
      dbUsers = JSON.parse(dbUsersStr) || {};
    } catch (e) {}

    if (oldUsersStr && Object.keys(dbUsers).length === 0) {
      console.log("[Migration] Migrating users from old localStorage format to database format.");
      localStorage.setItem('db_users', oldUsersStr);
    } else if (!dbUsersStr) {
      localStorage.setItem('db_users', JSON.stringify({}));
    }

    const oldDoctorUsersStr = localStorage.getItem('doctorUsers');
    const dbDoctorUsersStr = localStorage.getItem('db_doctorUsers');
    let dbDoctorUsers = {};
    try {
      dbDoctorUsers = JSON.parse(dbDoctorUsersStr) || {};
    } catch (e) {}

    if (oldDoctorUsersStr && Object.keys(dbDoctorUsers).length === 0) {
      console.log("[Migration] Migrating doctorUsers from old localStorage format to database format.");
      localStorage.setItem('db_doctorUsers', oldDoctorUsersStr);
    } else if (!dbDoctorUsersStr) {
      localStorage.setItem('db_doctorUsers', JSON.stringify({}));
    }

    const oldCustomDoctors = localStorage.getItem('customDoctors');
    const oldHardcodedSlots = localStorage.getItem('hardcodedSlots');
    let currentDocs = [];
    try {
      currentDocs = JSON.parse(localStorage.getItem('db_doctors')) || [];
    } catch (e) {}

    if (currentDocs.length === 0 || !localStorage.getItem('db_doctors')) {
      let doctorsList = [...hardcodedDoctors];
      
      if (oldHardcodedSlots) {
        const slotsMap = JSON.parse(oldHardcodedSlots) || {};
        doctorsList = doctorsList.map(docVal => {
          if (slotsMap[docVal.name] !== undefined) {
            return { ...docVal, slots: slotsMap[docVal.name] };
          }
          return docVal;
        });
      }

      if (oldCustomDoctors) {
        const customDocs = JSON.parse(oldCustomDoctors) || [];
        doctorsList = [...doctorsList, ...customDocs];
      }

      localStorage.setItem('db_doctors', JSON.stringify(doctorsList));
    } else {
      let updated = false;
      const specialtyFees = {
        "Cardiologist": 800,
        "Dermatologist": 500,
        "Gastroenterologist": 600,
        "Neurologist": 1000,
        "orthopedic Surgeon": 700,
        "gynecologist": 650,
        "Nephrologist": 900,
        "Endocrinologist": 850,
        "Otolaryngologist": 550,
        "General Surgeon": 600
      };
      
      currentDocs = currentDocs.map(d => {
        if (d.consultationFee === undefined || d.consultationFee === null || d.consultationFee === '' || d.consultationFee === '--') {
          updated = true;
          return { ...d, consultationFee: specialtyFees[d.specialty] || 500 };
        }
        return d;
      });

      if (oldCustomDoctors) {
        const customDocs = JSON.parse(oldCustomDoctors) || [];
        customDocs.forEach(customDoc => {
          if (!currentDocs.some(d => d.email === customDoc.email)) {
            const hasFee = customDoc.consultationFee !== undefined && customDoc.consultationFee !== null && customDoc.consultationFee !== '' && customDoc.consultationFee !== '--';
            currentDocs.push({
              ...customDoc,
              consultationFee: hasFee ? customDoc.consultationFee : (specialtyFees[customDoc.specialty] || 500)
            });
            updated = true;
          }
        });
      }
      if (updated) {
        localStorage.setItem('db_doctors', JSON.stringify(currentDocs));
      }
    }

    const oldFeedbackDataStr = localStorage.getItem('feedbackData');
    const dbFeedbacksStr = localStorage.getItem('db_feedbacks');
    let dbFeedbacks = {};
    try {
      dbFeedbacks = JSON.parse(dbFeedbacksStr) || {};
    } catch (e) {}

    if (oldFeedbackDataStr && Object.keys(dbFeedbacks).length === 0) {
      localStorage.setItem('db_feedbacks', oldFeedbackDataStr);
    } else if (!dbFeedbacksStr) {
      localStorage.setItem('db_feedbacks', JSON.stringify({}));
    }
    return;
  }

  try {
    const doctorsCollRef = collection(db, 'doctors');
    const querySnapshot = await getDocs(doctorsCollRef);
    if (querySnapshot.empty) {
      console.log("[Firebase] Seeding doctors list to Firestore...");
      // writeBatch lets us do up to 500 documents atomically
      const batch = writeBatch(db);
      for (const docData of hardcodedDoctors) {
        const docRef = doc(db, 'doctors', docData.name);
        batch.set(docRef, docData);
      }
      await batch.commit();
      console.log("[Firebase] Seeding completed successfully.");
    }
  } catch (error) {
    console.error("[Firebase] Error initializing/seeding Firestore: ", error);
  }
};

// Fetch all doctors from DB
export const fetchDoctors = async () => {
  if (useLocalStorageFallback) {
    return JSON.parse(localStorage.getItem('db_doctors')) || [];
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'doctors'));
    const list = [];
    const specialtyFees = {
      "Cardiologist": 800,
      "Dermatologist": 500,
      "Gastroenterologist": 600,
      "Neurologist": 1000,
      "orthopedic Surgeon": 700,
      "gynecologist": 650,
      "Nephrologist": 900,
      "Endocrinologist": 850,
      "Otolaryngologist": 550,
      "General Surgeon": 600
    };
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.consultationFee === undefined || data.consultationFee === null || data.consultationFee === '' || data.consultationFee === '--') {
        data.consultationFee = specialtyFees[data.specialty] || 500;
      }
      list.push(data);
    });
    return list;
  } catch (error) {
    console.error("[Firebase] Error fetching doctors list: ", error);
    return [];
  }
};

// Fetch users mapping (patients)
export const fetchUsers = async () => {
  if (useLocalStorageFallback) {
    return JSON.parse(localStorage.getItem('db_users')) || {};
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersMap = {};
    querySnapshot.forEach((docSnap) => {
      usersMap[docSnap.id] = docSnap.data();
    });
    return usersMap;
  } catch (error) {
    console.error("[Firebase] Error fetching users list: ", error);
    return {};
  }
};

// Fetch doctor accounts mapping (credentials)
export const fetchDoctorUsers = async () => {
  if (useLocalStorageFallback) {
    return JSON.parse(localStorage.getItem('db_doctorUsers')) || {};
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'doctorUsers'));
    const docUsersMap = {};
    querySnapshot.forEach((docSnap) => {
      docUsersMap[docSnap.id] = docSnap.data();
    });
    return docUsersMap;
  } catch (error) {
    console.error("[Firebase] Error fetching doctor users: ", error);
    return {};
  }
};

// Save newly registered user account (patient or doctor)
export const registerUser = async (email, userObj, type) => {
  if (useLocalStorageFallback) {
    const key = type === 'patient' ? 'db_users' : 'db_doctorUsers';
    const users = JSON.parse(localStorage.getItem(key)) || {};
    users[email] = { ...userObj, createdAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(users));
    return users;
  }

  try {
    const collectionName = type === 'patient' ? 'users' : 'doctorUsers';
    const docRef = doc(db, collectionName, email);
    const data = { ...userObj, createdAt: new Date().toISOString() };
    await setDoc(docRef, data);
    return type === 'patient' ? await fetchUsers() : await fetchDoctorUsers();
  } catch (error) {
    console.error("[Firebase] Error registering user: ", error);
    throw error;
  }
};

// Save / Update Doctor Profile Details (Doctor Dashboard)
export const saveDoctorProfile = async (email, profileData) => {
  if (useLocalStorageFallback) {
    const docs = JSON.parse(localStorage.getItem('db_doctors')) || [];
    const index = docs.findIndex(docVal => docVal.email === email);
    const defaultProfile = {
      rating: 4.5,
      status: "Available",
      slots: 10,
      consultationFee: 500
    };
    const updatedDoc = { ...defaultProfile, ...profileData, email };
    if (index !== -1) {
      docs[index] = { ...docs[index], ...updatedDoc };
    } else {
      docs.push(updatedDoc);
    }
    localStorage.setItem('db_doctors', JSON.stringify(docs));
    return docs;
  }

  try {
    const docRef = doc(db, 'doctors', email); // Use doctor email as document ID
    const defaultProfile = {
      rating: 4.5,
      status: "Available",
      slots: 10,
      consultationFee: 500
    };
    await setDoc(docRef, { ...defaultProfile, ...profileData, email }, { merge: true });
    return await fetchDoctors();
  } catch (error) {
    console.error("[Firebase] Error saving doctor profile: ", error);
    throw error;
  }
};

// Book an appointment: decrements doctor slots and adds booking to user history
export const bookAppointment = async (patientEmail, doctorName, patientName, phone, date, reminderTime) => {
  // Format date as DD-MM-YYYY
  const formatDateDMY = (dateStr) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}-${mm}-${yyyy}`;
  };

  const formattedDate = formatDateDMY(date);
  const bookedAt = new Date().toISOString();

  const appointment = {
    doctor: doctorName,
    patientName,
    phone,
    date: formattedDate,
    bookedAt,
    reminderTime: reminderTime || null,
    reminderStatus: reminderTime ? 'pending' : null
  };

  if (useLocalStorageFallback) {
    // 1. Decrement slot count
    const docs = JSON.parse(localStorage.getItem('db_doctors')) || [];
    const docIndex = docs.findIndex(d => d.name === doctorName);
    let fee = 500;
    if (docIndex !== -1) {
      const currentSlots = docs[docIndex].slots !== undefined ? docs[docIndex].slots : 10;
      if (currentSlots <= 0) {
        throw new Error("No slots available for this doctor.");
      }
      docs[docIndex].slots = currentSlots - 1;
      fee = docs[docIndex].consultationFee || 500;
      localStorage.setItem('db_doctors', JSON.stringify(docs));
    }

    const finalAppointment = { ...appointment, consultationFee: fee };

    // 2. Add booking to patient history list
    const users = JSON.parse(localStorage.getItem('db_users')) || {};
    if (!users[patientEmail]) {
      // Auto-create patient record in simulated database if it does not exist
      users[patientEmail] = {
        name: patientEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        history: [],
        feedbacks: []
      };
    }
    if (!users[patientEmail].history) users[patientEmail].history = [];
    users[patientEmail].history.push(finalAppointment);
    localStorage.setItem('db_users', JSON.stringify(users));
    return { users, doctors: docs };
  }

  try {
    // 1. Find doctor and decrement slot
    const docRef = await findDoctorDocRefByName(doctorName);
    let fee = 500;
    if (docRef) {
      const snap = await getDoc(docRef);
      const docData = snap.data();
      const currentSlots = docData.slots !== undefined ? docData.slots : 10;
      if (currentSlots <= 0) {
        throw new Error("No slots available for this doctor.");
      }
      await updateDoc(docRef, { slots: currentSlots - 1 });
      fee = docData.consultationFee || 500;
    }

    const finalAppointment = { ...appointment, consultationFee: fee };

    // 2. Add to user's history in Firestore
    const userRef = doc(db, 'users', patientEmail);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const historyList = userData.history || [];
      historyList.push(finalAppointment);
      await updateDoc(userRef, { history: historyList });
    } else {
      // Create user document in Firestore on the fly if missing
      await setDoc(userRef, {
        name: patientEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        history: [finalAppointment],
        feedbacks: []
      });
    }

    const updatedUsers = await fetchUsers();
    const updatedDoctors = await fetchDoctors();
    return { users: updatedUsers, doctors: updatedDoctors };
  } catch (error) {
    console.error("[Firebase] Error booking appointment: ", error);
    throw error;
  }
};

// Cancel appointment: increments doctor slots and removes booking from history
export const cancelAppointment = async (patientEmail, bookedAt) => {
  if (useLocalStorageFallback) {
    const users = JSON.parse(localStorage.getItem('db_users')) || {};
    const docs = JSON.parse(localStorage.getItem('db_doctors')) || [];

    if (users[patientEmail] && users[patientEmail].history) {
      const history = users[patientEmail].history;
      const index = history.findIndex(b => b.bookedAt === bookedAt);
      if (index !== -1) {
        const booking = history[index];
        // Increment slot
        const docIndex = docs.findIndex(d => d.name === booking.doctor);
        if (docIndex !== -1) {
          docs[docIndex].slots = (docs[docIndex].slots !== undefined ? docs[docIndex].slots : 10) + 1;
          localStorage.setItem('db_doctors', JSON.stringify(docs));
        }

        history.splice(index, 1);
        localStorage.setItem('db_users', JSON.stringify(users));
      }
    }
    return { users, doctors: docs };
  }

  try {
    const userRef = doc(db, 'users', patientEmail);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const historyList = userData.history || [];
      const index = historyList.findIndex(b => b.bookedAt === bookedAt);
      if (index !== -1) {
        const booking = historyList[index];

        // Increment slot count
        const docRef = await findDoctorDocRefByName(booking.doctor);
        if (docRef) {
          const snap = await getDoc(docRef);
          const currentSlots = snap.data().slots !== undefined ? snap.data().slots : 10;
          await updateDoc(docRef, { slots: currentSlots + 1 });
        }

        // Remove from list
        historyList.splice(index, 1);
        await updateDoc(userRef, { history: historyList });
      }
    }

    const updatedUsers = await fetchUsers();
    const updatedDoctors = await fetchDoctors();
    return { users: updatedUsers, doctors: updatedDoctors };
  } catch (error) {
    console.error("[Firebase] Error cancelling appointment: ", error);
    throw error;
  }
};

// Fetch feedbacks mapping (doctorName -> feedbacks array)
export const fetchFeedbacks = async () => {
  if (useLocalStorageFallback) {
    return JSON.parse(localStorage.getItem('db_feedbacks')) || {};
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'feedbacks'));
    const feedbacksMap = {};
    querySnapshot.forEach((docSnap) => {
      feedbacksMap[docSnap.id] = docSnap.data().feedbacks || [];
    });
    return feedbacksMap;
  } catch (error) {
    console.error("[Firebase] Error fetching feedbacks list: ", error);
    return {};
  }
};

// Submit feedback: saves to global reviews mapping and to user feedback history
export const submitFeedback = async (patientEmail, doctorName, feedbackName, rating, text) => {
  const feedbackDateStr = new Date().toLocaleDateString('en-IN');
  const submittedAt = new Date().toISOString();

  const feedbackObj = {
    name: feedbackName,
    rating,
    text,
    date: feedbackDateStr
  };

  const patientFeedbackObj = {
    doctor: doctorName,
    rating,
    text,
    date: feedbackDateStr,
    submittedAt
  };

  if (useLocalStorageFallback) {
    const feedbacks = JSON.parse(localStorage.getItem('db_feedbacks')) || {};
    if (!feedbacks[doctorName]) feedbacks[doctorName] = [];
    feedbacks[doctorName].push(feedbackObj);
    localStorage.setItem('db_feedbacks', JSON.stringify(feedbacks));

    const users = JSON.parse(localStorage.getItem('db_users')) || {};
    if (!users[patientEmail]) {
      users[patientEmail] = {
        name: patientEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        history: [],
        feedbacks: []
      };
    }
    if (!users[patientEmail].feedbacks) users[patientEmail].feedbacks = [];
    users[patientEmail].feedbacks.push(patientFeedbackObj);
    localStorage.setItem('db_users', JSON.stringify(users));
    return { feedbacks, users };
  }

  try {
    // 1. Save to doctor feedbacks document
    const feedbackDocRef = doc(db, 'feedbacks', doctorName);
    const feedbackDocSnap = await getDoc(feedbackDocRef);
    let list = [];
    if (feedbackDocSnap.exists()) {
      list = feedbackDocSnap.data().feedbacks || [];
    }
    list.push(feedbackObj);
    await setDoc(feedbackDocRef, { feedbacks: list });

    // 2. Save to patient history
    const userRef = doc(db, 'users', patientEmail);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const userFeedbacks = userData.feedbacks || [];
      userFeedbacks.push(patientFeedbackObj);
      await updateDoc(userRef, { feedbacks: userFeedbacks });
    } else {
      // Auto-create user document in Firestore if missing
      await setDoc(userRef, {
        name: patientEmail.split('@')[0],
        createdAt: new Date().toISOString(),
        history: [],
        feedbacks: [patientFeedbackObj]
      });
    }

    const updatedFeedbacks = await fetchFeedbacks();
    const updatedUsers = await fetchUsers();
    return { feedbacks: updatedFeedbacks, users: updatedUsers };
  } catch (error) {
    console.error("[Firebase] Error submitting feedback: ", error);
    throw error;
  }
};

// Set appointment reminder
export const setReminder = async (patientEmail, bookedAt, reminderTime) => {
  if (useLocalStorageFallback) {
    const users = JSON.parse(localStorage.getItem('db_users')) || {};
    if (users[patientEmail] && users[patientEmail].history) {
      users[patientEmail].history = users[patientEmail].history.map(b => {
        if (b.bookedAt === bookedAt) {
          return { ...b, reminderTime, reminderStatus: 'pending' };
        }
        return b;
      });
      localStorage.setItem('db_users', JSON.stringify(users));
    }
    return users;
  }

  try {
    const userRef = doc(db, 'users', patientEmail);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const historyList = userData.history || [];
      const updatedHistory = historyList.map(b => {
        if (b.bookedAt === bookedAt) {
          return { ...b, reminderTime, reminderStatus: 'pending' };
        }
        return b;
      });
      await updateDoc(userRef, { history: updatedHistory });
    }
    return await fetchUsers();
  } catch (error) {
    console.error("[Firebase] Error setting reminder: ", error);
    throw error;
  }
};

// Remove appointment reminder
export const removeReminder = async (patientEmail, bookedAt) => {
  if (useLocalStorageFallback) {
    const users = JSON.parse(localStorage.getItem('db_users')) || {};
    if (users[patientEmail] && users[patientEmail].history) {
      users[patientEmail].history = users[patientEmail].history.map(b => {
        if (b.bookedAt === bookedAt) {
          return { ...b, reminderTime: null, reminderStatus: null };
        }
        return b;
      });
      localStorage.setItem('db_users', JSON.stringify(users));
    }
    return users;
  }

  try {
    const userRef = doc(db, 'users', patientEmail);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const historyList = userData.history || [];
      const updatedHistory = historyList.map(b => {
        if (b.bookedAt === bookedAt) {
          return { ...b, reminderTime: null, reminderStatus: null };
        }
        return b;
      });
      await updateDoc(userRef, { history: updatedHistory });
    }
    return await fetchUsers();
  } catch (error) {
    console.error("[Firebase] Error removing reminder: ", error);
    throw error;
  }
};

// Update reminder status (e.g. from 'pending' to 'triggered' on background alarm)
export const updateReminderStatus = async (patientEmail, bookedAt, status) => {
  if (useLocalStorageFallback) {
    const users = JSON.parse(localStorage.getItem('db_users')) || {};
    if (users[patientEmail] && users[patientEmail].history) {
      users[patientEmail].history = users[patientEmail].history.map(b => {
        if (b.bookedAt === bookedAt) {
          return { ...b, reminderStatus: status };
        }
        return b;
      });
      localStorage.setItem('db_users', JSON.stringify(users));
    }
    return users;
  }

  try {
    const userRef = doc(db, 'users', patientEmail);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const historyList = userData.history || [];
      const updatedHistory = historyList.map(b => {
        if (b.bookedAt === bookedAt) {
          return { ...b, reminderStatus: status };
        }
        return b;
      });
      await updateDoc(userRef, { history: updatedHistory });
    }
    return await fetchUsers();
  } catch (error) {
    console.error("[Firebase] Error updating reminder status: ", error);
    throw error;
  }
};
