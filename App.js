import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { NavigationContainer } from "@react-navigation/native";
import { UserContextProvider } from "./src/database/UserContext";
import MainNavigator from "./src/navigation/MainNavigator";

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  const loadFonts = async () => {
    await Font.loadAsync({
      mLight: require("./assets/fonts/Montserrat-Light.ttf"),
      mLighti: require("./assets/fonts/Montserrat-LightItalic.ttf"),
      mRegular: require("./assets/fonts/Montserrat-Regular.ttf"),
      mRegulari: require("./assets/fonts/Montserrat-Italic.ttf"),
      mBold: require("./assets/fonts/Montserrat-Bold.ttf"),
      mBoldi: require("./assets/fonts/Montserrat-BoldItalic.ttf"),
    });
    setFontsLoaded(true);
  };

  useEffect(() => {
    const prepare = async () => {
      try {
        // Keep the splash screen visible while we fetch resources
        await SplashScreen.preventAutoHideAsync();
        // Load fonts
        await loadFonts();
      } catch (e) {
        console.warn(e);
      } finally {
        setFontsLoaded(true);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>loading!</Text>
      </View>
    );
  }

  return (
    <UserContextProvider>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </UserContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "mRegular",
  },
});
