import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Init({ navigation }) {
  return (
    <View style={styles.container}>
      <Text>SUN SHOWER</Text>
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.navigate("LogIn")}>
          <Text>Log In</Text>
        </TouchableOpacity>
        <Text>|</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
          <Text>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  menu: {
    flexDirection: "row", // 아이템들을 가로로 나열
    justifyContent: "space-between", // 아이템 사이에 동일한 간격
    alignItems: "center",
    width: 100,
    marginTop: 10,
  },
});
