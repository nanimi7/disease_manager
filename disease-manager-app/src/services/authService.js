import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * 회원가입
 */
export const signUp = async (email, password) => {
  try {
    // Firebase Authentication에 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Firestore에 사용자 정보 저장
    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      email: email,
      birthdate: '',
      gender: '',
      createdAt: new Date()
    });

    return { success: true, user };
  } catch (error) {
    console.error('회원가입 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 로그인
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('로그인 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 로그아웃
 */
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('로그아웃 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자 정보 가져오기
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }
  } catch (error) {
    console.error('사용자 정보 조회 에러:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자 정보 업데이트
 */
export const updateUserData = async (userId, data) => {
  try {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('사용자 정보 업데이트 에러:', error);
    return { success: false, error: error.message };
  }
};
