import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * 질병 추가
 */
export const addDisease = async (userId, diseaseName, medication) => {
  try {
    const docRef = await addDoc(collection(db, 'diseases'), {
      userId,
      diseaseName,
      medication,
      createdAt: new Date()
    });
    return { success: true, diseaseId: docRef.id };
  } catch (error) {
    console.error('질병 추가 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 질병 목록 가져오기
 */
export const getUserDiseases = async (userId) => {
  try {
    const q = query(collection(db, 'diseases'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const diseases = [];
    querySnapshot.forEach((doc) => {
      diseases.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, diseases };
  } catch (error) {
    console.error('질병 목록 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 질병 수정
 */
export const updateDisease = async (diseaseId, diseaseName, medication) => {
  try {
    const diseaseRef = doc(db, 'diseases', diseaseId);
    await updateDoc(diseaseRef, {
      diseaseName,
      medication,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('질병 수정 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 질병 삭제
 */
export const deleteDisease = async (diseaseId) => {
  try {
    await deleteDoc(doc(db, 'diseases', diseaseId));
    return { success: true };
  } catch (error) {
    console.error('질병 삭제 에러:', error);
    return { success: false, error: error.message };
  }
};
