import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * 증상 기록 추가
 */
export const addSymptomRecord = async (userId, diseaseId, date, painLevel, medicationTaken, details) => {
  try {
    const docRef = await addDoc(collection(db, 'symptomRecords'), {
      userId,
      diseaseId,
      date,
      painLevel,
      medicationTaken,
      details,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, recordId: docRef.id };
  } catch (error) {
    console.error('증상 기록 추가 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 특정 날짜의 증상 기록 가져오기
 */
export const getSymptomsByDate = async (userId, date) => {
  try {
    const q = query(
      collection(db, 'symptomRecords'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    const symptoms = [];
    querySnapshot.forEach((doc) => {
      symptoms.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, symptoms };
  } catch (error) {
    console.error('증상 기록 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 기간별 증상 기록 가져오기
 */
export const getSymptomsByDateRange = async (userId, startDate, endDate, diseaseId = null) => {
  try {
    let q;
    if (diseaseId) {
      q = query(
        collection(db, 'symptomRecords'),
        where('userId', '==', userId),
        where('diseaseId', '==', diseaseId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        collection(db, 'symptomRecords'),
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    const symptoms = [];
    querySnapshot.forEach((doc) => {
      symptoms.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, symptoms };
  } catch (error) {
    console.error('기간별 증상 기록 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 특정 월의 증상 기록 가져오기
 */
export const getSymptomsByMonth = async (userId, year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const q = query(
      collection(db, 'symptomRecords'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const querySnapshot = await getDocs(q);
    const symptoms = [];
    querySnapshot.forEach((doc) => {
      symptoms.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, symptoms };
  } catch (error) {
    console.error('월별 증상 기록 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 증상 기록 수정
 */
export const updateSymptomRecord = async (recordId, painLevel, medicationTaken, details) => {
  try {
    const recordRef = doc(db, 'symptomRecords', recordId);
    await updateDoc(recordRef, {
      painLevel,
      medicationTaken,
      details,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('증상 기록 수정 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 증상 기록 삭제
 */
export const deleteSymptomRecord = async (recordId) => {
  try {
    await deleteDoc(doc(db, 'symptomRecords', recordId));
    return { success: true };
  } catch (error) {
    console.error('증상 기록 삭제 에러:', error);
    return { success: false, error: error.message };
  }
};
