import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import axios from "axios";
import * as Location from "expo-location";

const getAirQualityStatus = (aqi) => {
  if (aqi == 1) {
    return "Good";
  } else if (aqi == 2) {
    return "Fair";
  } else if (aqi == 3) {
    return "Moderate";
  } else if (aqi == 4) {
    return "Poor";
  } else {
    return "Very Poor";
  }
};

const getUVIndexStatus = (uvi) => {
  if (uvi <= 2) {
    return "Low";
  } else if (uvi <= 5) {
    return "Moderate";
  } else if (uvi <= 7) {
    return "High";
  } else if (uvi <= 10) {
    return "Very High";
  } else {
    return "Extreme";
  }
};

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [UVIndexData, setUVIndexData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);

  const API_key = "716a715894ba5a341f679d85841f00e7";

  useEffect(() => {
    const fetchData = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lon } = location.coords;

      const Weather_URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_key}`;
      const UV_URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_key}`;
      const Air_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_key}`;

      Promise.all([axios.get(Weather_URL), axios.get(UV_URL), axios.get(Air_URL)])
        .then((responses) => {
          setWeatherData(responses[0].data.current.weather[0]);
          setUVIndexData(responses[1].data.current);
          setAirQualityData(responses[2].data.list[0].main);
        })
        .catch((error) => console.error(error));
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60 * 60 * 1000); // Fetch every 60 minutes

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []);

  return (
    <View style={styles.container}>
      {/* 날씨 정보 렌더링 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Weather</Text>
        <Text style={styles.data}>{weatherData ? weatherData.main : "Loading..."}</Text>
        <Text style={styles.description}>
          {weatherData ? weatherData.description : "Loading..."}
        </Text>
      </View>

      {/* 자외선 지수 정보 렌더링 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>UV Index</Text>
        <Text style={styles.data}>
          {UVIndexData ? getUVIndexStatus(UVIndexData.uvi) : "Loading..."}
        </Text>
      </View>

      {/* 공기질 정보 렌더링 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Air Quality</Text>
        <Text style={styles.data}>
          {airQualityData ? getAirQualityStatus(airQualityData.aqi) : "Loading..."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    backgroundColor: "aliceblue",
    width: 300,
    height: 100,
    marginTop: 20,
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  data: {
    fontSize: 16,
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
});

export default Weather;
