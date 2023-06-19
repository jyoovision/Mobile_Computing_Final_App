// UserContext.js
import React, { createContext, useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db, auth } from "../database/FirebaseAuth";

import * as Location from "expo-location";

export const UserContext = createContext();

export const UserContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        const userRef = doc(db, "users", userAuth.uid);

        const unsubscribeSnapshot = onSnapshot(userRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUser(docSnapshot.data());
          } else {
            console.log("No such document!");
          }
        });

        // Return function to unsubscribe from the snapshot on unmount or when user logs out
        return () => {
          unsubscribeSnapshot();
          setUser(null);
        };
      } else {
        setUser(null);
      }
    });

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      // Use watchPositionAsync to update location in real-time
      const locationSubscriber = await Location.watchPositionAsync(
        { distanceInterval: 1000 }, // Update every 1km. Adjust as needed.
        (location) => {
          setLocation(location.coords);
        }
      );

      return () => {
        locationSubscriber.remove(); // Unsubscribe from updates when component unmounts
      };
    })();

    return unsubscribeAuth;
  }, []);

  return <UserContext.Provider value={{ user, location }}>{props.children}</UserContext.Provider>;
};
