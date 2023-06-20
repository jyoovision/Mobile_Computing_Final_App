// Login.js
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native"; // Alert 추가
import { loginUser } from "../database/FirebaseAuth";
import { CommonActions } from "@react-navigation/native";

export default function LogIn({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    const response = await loginUser(email, password);
    if (response.success) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Sunshower" }],
        })
      );
    } else {
      Alert.alert("Log in Failed", response.error); // 로그인 실패시 Alert으로 오류 메시지 출력
    }
  };

  const test = async () => {
    navigation.navigate("Sunshower");
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
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Log In</Text>
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
