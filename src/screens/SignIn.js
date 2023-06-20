import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native"; // Alert 추가
import { registerUser } from "../database/FirebaseAuth";
import { CommonActions } from "@react-navigation/native";
import { Gravity } from "expo-sensors/build/DeviceMotion";

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUserName] = useState("");
  const [description, setDescription] = useState("");
  const [URI, setURI] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  );

  useEffect(() => {
    if (name) {
      setUserName(`${name}'s user name`);
      setDescription(`${name}'s profile introduction`);
    }
  }, [name]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Failure", "Please enter your name"); // alert 사용
      return;
    }
    const response = await registerUser(email, password, name, username, URI, description);
    if (response.success) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Sunshower" }],
        })
      );
    } else {
      Alert.alert("Sign in Failed", response.error); // 가입 실패시 Alert으로 오류 메시지 출력
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SUN SHOWER</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="darkgray"
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="darkgray"
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Name"
        placeholderTextColor="darkgray"
        onChangeText={setName}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    color: "black",
    width: "80%",
    height: 28,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  button: {
    backgroundColor: "transparent",
    paddingHorizontal: 18,
    marginTop: 10,
  },
  buttonText: {
    color: "#007AFF",
    fontSize: 20,
    textAlign: "center",
  },
});
