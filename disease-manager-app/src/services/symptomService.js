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
export const addSymptomRecord = async (userId, diseaseId, date, painLevel, medicationTaken, details, symptomTime = null) => {
  try {
    const docRef = await addDoc(collection(db, 'symptomRecords'), {
      userId,
      diseaseId,
      date,
      painLevel,
      medicationTaken,
      details,
      symptomTime,
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
 * 기간별 증상 기록 가져오기 (인덱스 없이 작동)
 */
export const getSymptomsByDateRange = async (userId, startDate, endDate, diseaseId = null) => {
  try {
    // userId로만 쿼리하고, 나머지는 클라이언트에서 필터링
    const q = query(
      collection(db, 'symptomRecords'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    let symptoms = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // 클라이언트에서 날짜 범위 및 diseaseId 필터링
      if (data.date >= startDate && data.date <= endDate) {
        if (!diseaseId || data.diseaseId === diseaseId) {
          symptoms.push({ id: doc.id, ...data });
        }
      }
    });
    // 날짜 내림차순 정렬
    symptoms.sort((a, b) => b.date.localeCompare(a.date));
    return { success: true, symptoms };
  } catch (error) {
    console.error('기간별 증상 기록 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 특정 월의 증상 기록 가져오기 (인덱스 없이 작동)
 */
export const getSymptomsByMonth = async (userId, year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // userId로만 쿼리하고, 날짜 필터링은 클라이언트에서 수행
    const q = query(
      collection(db, 'symptomRecords'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const symptoms = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // 클라이언트에서 날짜 범위 필터링
      if (data.date >= startDate && data.date <= endDate) {
        symptoms.push({ id: doc.id, ...data });
      }
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
export const updateSymptomRecord = async (recordId, painLevel, medicationTaken, details, symptomTime = null) => {
  try {
    const recordRef = doc(db, 'symptomRecords', recordId);
    await updateDoc(recordRef, {
      painLevel,
      medicationTaken,
      details,
      symptomTime,
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
