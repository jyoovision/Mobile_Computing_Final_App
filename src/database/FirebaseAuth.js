// FirebaseAuth.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {
  updateDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage를 위한 import

const firebaseConfig = {
  apiKey: "AIzaSyBn4_Xwd9CZbXXPqSuToZpIPgN0YTs_xSA",
  authDomain: "mobile-computing-a4157.firebaseapp.com",
  projectId: "mobile-computing-a4157",
  storageBucket: "mobile-computing-a4157.appspot.com",
  messagingSenderId: "417512741415",
  appId: "1:417512741415:web:0d38aca15eb24a4c53cc02",
  measurementId: "G-2LHEK6YSWJ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage(app); // Firebase Storage 초기화

export async function registerUser(email, password, name, username, URI, description) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a Firestore document for the user
    const additionalData = { name, username, URI, description };
    const userData = {
      email: user.email,
      uid: user.uid,
      ...additionalData,
    };

    await setDoc(doc(db, "users", user.uid), userData);
    console.log("User registered with email and password and additional data: ", userData);
    await loginUser(email, password);
    return { success: true }; // Registration was successful, so return an object with success property
  } catch (error) {
    console.error("Error registering with password and email", error);
    return { success: false, error: error.message }; // There was an error, so return an object with success property and error message
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User logged in with email and password: ", user);
    return { success: true }; // Login was successful, so return an object with success property
  } catch (error) {
    console.error("Error logging in with password and email", error);
    return { success: false, error: error.message }; // There was an error, so return an object with success property and error message
  }
}

export async function fetchAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => doc.data());

    console.log("Fetched all users: ", users);
    return users;
  } catch (error) {
    console.error("Error fetching all users: ", error);
  }
}

// fetchAllUsers();

// File path와 file object를 인수로 받는 함수를 작성합니다.
export const uploadImageToFirebase = async (filePath, file) => {
  const storageRef = ref(storage, filePath); // File path에 해당하는 Storage Reference를 가져옵니다.
  const uploadTask = uploadBytesResumable(storageRef, file); // 이미지 업로드를 시작합니다.

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // 진행 상태를 보고할 수 있습니다. 예를 들어, UI에서 진행률을 표시하는 데 사용할 수 있습니다.
      },
      (error) => {
        // 에러 처리
        reject(error);
      },
      () => {
        // 업로드 완료 후 download URL을 가져옵니다.
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

// 게시물 데이터와 이미지 파일을 받아 Firestore와 Storage에 저장하는 함수입니다.
export async function createPost(postData, imageFile) {
  try {
    // 1. 이미지를 Storage에 업로드하고, 이미지의 URL을 가져옵니다.
    const filePath = `postImages/${auth.currentUser.uid}/${Date.now()}`;
    const imageUrl = await uploadImageToFirebase(filePath, imageFile);

    // 2. Firestore에 게시물을 저장합니다.
    const postDataWithImage = {
      ...postData,
      imageUrl, // 첨부 이미지의 URL을 추가합니다.
      createdAt: new Date(), // 현재 시간을 추가합니다.
      userId: auth.currentUser.uid, // 현재 사용자의 ID를 추가합니다.
    };
    await addDoc(collection(db, "posts"), postDataWithImage);
    console.log("Post created with data: ", postDataWithImage);

    return true; // 게시물 생성이 성공적으로 완료되었으므로 true를 반환합니다.
  } catch (error) {
    console.error("Error creating post: ", error);
    return false; // 게시물 생성에 실패했으므로 false를 반환합니다.
  }
}

//
export async function fetchUserProfileImage(userId) {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.URI; // 'URI' 필드가 프로필 이미지 URL을 저장하는 필드라고 가정
    } else {
      console.error("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile image: ", error);
    return null;
  }
}

// 모든 유저의 포스트 가져오기
export async function fetchAllPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const posts = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    console.log("Fetched all posts: ", posts);
    return posts;
  } catch (error) {
    console.error("Error fetching all posts: ", error);
  }
}

// 유저 친구들의 포스트 가져오기
export async function fetchFriendsPosts(userId) {
  try {
    const friends = await fetchFriends(userId); // 현재 유저의 친구 목록을 가져옵니다.
    const friendsPosts = await Promise.all(
      // 각 친구의 게시물들을 가져옵니다.
      friends.map((friend) => fetchUserPosts(friend.uid))
    );

    // 현재 유저 자신의 게시물을 가져옵니다.
    const userPosts = await fetchUserPosts(userId);

    // 친구들의 게시물 리스트와 유저 자신의 게시물 리스트를 하나의 리스트로 합칩니다.
    const allPosts = [].concat(...friendsPosts, userPosts);

    //  시간 순으로 정렬
    const sortedPosts = allPosts.sort((a, b) => b.createdAt - a.createdAt);

    console.log("Fetched all posts: ", allPosts);
    return sortedPosts;
  } catch (error) {
    console.error("Error fetching all posts: ", error);
  }
}

// 한 유저의 모든 포스트 조회
export async function fetchUserPosts(userId) {
  try {
    const q = query(collection(db, "posts"), where("userId", "==", userId)); // userId가 입력받은 userId와 같은 모든 게시물을 가져옵니다.
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    console.log(`Fetched all posts of user ${userId}: `, posts);
    return posts;
  } catch (error) {
    console.error(`Error fetching all posts of user ${userId}: `, error);
  }
}

// 유저 이름으로 친구 조회
export async function fetchUserByName(name) {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("name", "==", name)));
    const users = querySnapshot.docs.map((doc) => doc.data());
    console.log("Fetched users by name: ", users);
    return users; // returns an array of users
  } catch (error) {
    console.error("Error fetching users by name: ", error);
  }
}

// 유저의 세부 정보 받아오기
export async function getUserDetails(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data(), uid: userId };
    }
  } catch (error) {
    console.error("Error fetching user details: ", error);
  }
}

// 친구 요청 보내기
export async function sendFriendRequest(requesterId, requesteeId) {
  try {
    const newRequest = {
      requesterId,
      requesteeId,
      status: "pending",
    };
    await addDoc(collection(db, "friendRequests"), newRequest);
    console.log("Friend request sent: ", newRequest);
  } catch (error) {
    console.error("Error sending friend request: ", error);
  }
}

// 친구 요청 받기
export async function fetchFriendRequests(requesteeId) {
  try {
    const q = query(
      collection(db, "friendRequests"),
      where("requesteeId", "==", requesteeId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    const requests = [];
    for (const doc of querySnapshot.docs) {
      const request = doc.data();
      const requester = await getUserDetails(request.requesterId);
      const requestee = await getUserDetails(request.requesteeId);
      requests.push({
        id: doc.id,
        requester: requester,
        requestee: requestee,
        status: request.status,
      });
    }
    console.log("Fetched friend requests: ", requests);
    return requests;
  } catch (error) {
    console.error("Error fetching friend requests: ", error);
  }
}

// 친구 요청 수락
export async function acceptFriendRequest(requestId) {
  try {
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, {
      status: "accepted",
    });
    console.log("Friend request accepted: ", requestId);
  } catch (error) {
    console.error("Error accepting friend request: ", error);
  }
}
// 친구 요청 거절
export async function rejectFriendRequest(requestId) {
  try {
    const requestRef = doc(db, "friendRequests", requestId);
    await updateDoc(requestRef, {
      status: "rejected",
    });
    console.log("Friend request rejected: ", requestId);
  } catch (error) {
    console.error("Error rejecting friend request: ", error);
  }
}
// 친구 목록 조회
export async function fetchFriends(userId) {
  try {
    const q1 = query(
      collection(db, "friendRequests"),
      where("requesterId", "==", userId),
      where("status", "==", "accepted")
    );
    const q2 = query(
      collection(db, "friendRequests"),
      where("requesteeId", "==", userId),
      where("status", "==", "accepted")
    );
    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    const friendIds = [...querySnapshot1.docs, ...querySnapshot2.docs].map((doc) =>
      doc.data().requesterId === userId ? doc.data().requesteeId : doc.data().requesterId
    );

    const friends = [];
    for (const id of friendIds) {
      const docRef = doc(db, "users", id); // users 컬렉션에 id로 문서를 참조
      const docSnap = await getDoc(docRef); // 문서 스냅샷을 가져옴
      if (docSnap.exists()) {
        friends.push({ ...docSnap.data(), uid: id }); // friends 배열에 유저 정보 추가
      }
    }

    console.log("Fetched friends: ", friends);
    return friends;
  } catch (error) {
    console.error("Error fetching friends: ", error);
  }
}

export { app, auth, db, storage };
