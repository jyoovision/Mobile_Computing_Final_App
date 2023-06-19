// Profile.js
import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-elements";
import UserSkylogs from "../components/UserSkylogs";
import { CommonActions } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../database/FirebaseAuth";
import { UserContext } from "../database/UserContext";
import Geocoder from "react-native-geocoding";

const Profile = ({ navigation }) => {
  const { user, location } = useContext(UserContext);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    (async () => {
      if (location) {
        // Initialize the Geocoder
        Geocoder.init("AIzaSyBn4_Xwd9CZbXXPqSuToZpIPgN0YTs_xSA"); // use your Geocoding API key here

        // Use Geocoder to convert latitude and longitude into human-readable address
        const { latitude, longitude } = location;

        Geocoder.from(latitude, longitude)
          .then((json) => {
            const addressComponent = json.results[0].formatted_address;
            setAddress(addressComponent);
          })
          .catch((error) => console.warn(error));
      }
    })();
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Init" }],
        })
      );
    } catch (error) {
      console.error("Failed to sign out: ", error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.profile}>
          <Avatar
            size={80}
            rounded
            source={{
              uri: user.URI,
            }}
            containerStyle={{ marginRight: 10 }}
          />
          <Text style={styles.title}>{user.name}</Text>
          <Text>{user.username}</Text>
          <Text>{user.description}</Text>
          <Text>{address}</Text>
          <UserSkylogs />
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logout}>Log out</Text>
          </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  profile: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  logout: {
    color: "red",
  },
});

export default Profile;
