// MainNavigator.js
import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, Animated, TouchableOpacity, StyleSheet } from "react-native";
import { Avatar } from "react-native-elements";

import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import ProgressBar from "../services/Progress-Camera"; // 프로그레스 바 컴포넌트 import

import Init from "../screens/Init";
import LogIn from "../screens/LogIn";
import SignIn from "../screens/SignIn";
import Main from "../screens/Main";
import Group from "../screens/Group";
import Global from "../screens/Global";
import Profile from "../screens/Profile";
import Friends from "../screens/Friends";
import EditProfile from "../screens/EditProfile";

import { UserContext } from "../database/UserContext";

//애니메이션 트랜지션(오->왼)
function RLTransition({ current, next, inverted, layouts: { screen } }) {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [screen.width, 0, screen.width * -1],
              extrapolate: "clamp",
            }),
            inverted
          ),
        },
      ],
    },
  };
}

//애니메이션 트랜지션(왼->오)
function LRTransition({ current, next, inverted, layouts: { screen } }) {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [-screen.width, 0, screen.width],
              extrapolate: "clamp",
            }),
            inverted
          ),
        },
      ],
    },
  };
}

//애니메이션 트렌지션(아래->위)
function BTTransition({ current, next, inverted, layouts: { screen } }) {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: "clamp",
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateY: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [screen.height, 0, -screen.height],
              extrapolate: "clamp",
            }),
            inverted
          ),
        },
      ],
    },
  };
}

//tab 메뉴바로 접근
const Tab = createMaterialTopTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Main"
      // tabBarPosition="None"
      // tabBarPosition="Bottom"
      screenOptions={{
        swipeEnabled: true,
        tabBarStyle: {
          position: "absolute",
          height: 50,
          width: 240,
          bottom: 40,
          left: "50%",
          marginLeft: -120,
          borderRadius: 50,
          backgroundColor: "lightgray",
        },
        tabBarIndicatorStyle: {
          //width: 50,
          height: 50,
          //bottom: 0,
          borderRadius: 50,
          backgroundColor: "#0099FF",
        },
      }}
    >
      <Tab.Screen name="Main" component={Main} />
      <Tab.Screen name="Group" component={Group} />
      <Tab.Screen name="Global" component={Global} />
      {/* ...other screens... */}
    </Tab.Navigator>
  );
}

function TabWithProgress() {
  return (
    <View style={{ flex: 1 }}>
      <ProgressBar />
      <TabNavigator />
    </View>
  );
}

//stack 프로필, 친구추가 접근
const Stack = createStackNavigator();

function MainNavigator() {
  const { user } = useContext(UserContext);
  return (
    <Stack.Navigator
      initialRouteName="Init"
      screenOptions={({ navigation }) => ({
        headerRight: () => (
          <Avatar
            rounded
            size="small"
            source={{
              uri: user?.URI,
            }}
            onPress={() => navigation.navigate("Profile")}
            containerStyle={{ marginRight: 10 }}
          />
        ),
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Friends")}
            style={styles.headermenu}
          >
            <Text>Friends</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen name="Init" component={Init} options={{ headerShown: false }} />
      <Stack.Screen name="LogIn" component={LogIn} options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignIn} options={{ headerShown: false }} />
      <Stack.Screen
        name="Sunshower"
        options={{ title: "SUN SHOWER" }}
        component={TabWithProgress}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={({ navigation }) => ({
          headerBackTitleVisible: false,
          headerLeft: (props) => (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headermenu}
            >
              <Text>Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile")}
              style={styles.headermenu}
            >
              <Text>Edit</Text>
            </TouchableOpacity>
          ),
          cardStyleInterpolator: RLTransition,
          //cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        })}
      />
      <Stack.Screen
        name="Friends"
        component={Friends}
        options={({ navigation }) => ({
          headerBackTitleVisible: false,
          headerRight: (props) => (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headermenu}
            >
              <Text>Back</Text>
            </TouchableOpacity>
          ),
          headerLeft: null,
          cardStyleInterpolator: LRTransition,
          //cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={({ navigation, route }) => ({
          title: "Edit Profile",
          headerRight: (props) => (
            <TouchableOpacity
              onPress={() => {
                navigation.setParams({ save: true });
              }}
              style={styles.headermenu}
            >
              <Text>Save</Text>
            </TouchableOpacity>
          ),
          headerLeft: (props) => (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.headermenu}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          ),
          cardStyleInterpolator: BTTransition,
          //cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          gestureEnabled: false,
        })}
      />
    </Stack.Navigator>
  );
}

export default MainNavigator;

const styles = StyleSheet.create({
  headermenu: {
    marginRight: 10,
    marginLeft: 10,
  },
});
