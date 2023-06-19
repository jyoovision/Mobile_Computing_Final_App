// EditProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Avatar } from "react-native-elements";
import * as ImagePicker from "expo-image-picker";

import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../database/FirebaseAuth";

import { storage } from "../database/FirebaseAuth"; // Firebase Storage를 import 합니다.

import { uploadImageToFirebase } from "../database/FirebaseAuth";

const { width } = Dimensions.get("window");

const EditProfile = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [username, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [URI, setURI] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  );

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocumentRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocumentRef);

        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUserName(user.username);
      setDescription(user.description);
      setURI(user.URI);
    }
  }, [user]);

  useEffect(() => {
    if (route.params?.save) {
      updateProfile();
    }
  }, [route.params?.save]);

  const updateProfile = async () => {
    try {
      const userDocumentRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocumentRef, {
        name: name,
        username: username,
        description: description,
        URI: URI, // Firebase Storage에 저장된 이미지 URL
      });
      Alert.alert("Success", "Profile Updated Successfully");
      navigation.goBack(); // navigate back after updating
    } catch (error) {
      Alert.alert("Error", "There was an error updating your profile");
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "You need to grant media library permission to change the profile picture."
      );
      return false;
    }
    return true;
  };

  const handleAvatarPress = async () => {
    // 권한 요청
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // 즉시 로컬 이미지 URI를 화면에 표시합니다.
        setURI(fileUri);

        // 이미지를 Firebase Storage에 비동기로 업로드합니다.
        uploadImageToFirebase(`profileImages/${auth.currentUser.uid}`, blob)
          .then((downloadURL) => {
            // 업로드가 성공하면 다운로드 URL로 URI를 업데이트합니다.
            setURI(downloadURL);

            // 그리고 Firestore 문서도 업데이트합니다.
            const userDocumentRef = doc(db, "users", auth.currentUser.uid);
            updateDoc(userDocumentRef, {
              URI: downloadURL, // Firebase Storage에 저장된 이미지 URL
            });
          })
          .catch((error) => {
            // 업로드가 실패하면 사용자에게 알립니다.
            Alert.alert("Error", "An error occurred while uploading the image. Please try again.");
            console.log(error);
            // URI를 원래 값으로 되돌립니다.
            setURI(user.URI);
          });
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking the image. Please try again.");
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profile}>
          <TouchableOpacity style={{ alignItems: "center", marginBottom: 30 }}>
            <Avatar
              size={80}
              rounded
              source={{
                uri: URI,
              }}
              onPress={handleAvatarPress}
            />
            <Text style={styles.avatarText}>Change Profile Image</Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name:</Text>
            <TextInput style={styles.input} value={name} onChangeText={(text) => setName(text)} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => setUserName(text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Profile Introduction:</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={(text) => setDescription(text)}
              multiline
            />
          </View>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center", // Add this
  },
  profile: {
    alignItems: "center",
  },
  avatarText: {
    marginTop: 10,
    color: "#888",
  },
  inputContainer: {
    width: width - 100,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  inputLabel: {
    width: 150,
    fontSize: 16,
    color: "#444",
    paddingRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
});

export default EditProfile;
