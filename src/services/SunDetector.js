import React, { useState, useEffect } from "react";
import axios from "axios";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
const WeatherList = require("../utils/WeatherList.json");

const useSunDetector = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isWifi, setIsWifi] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const API_key = "716a715894ba5a341f679d85841f00e7";

  useEffect(() => {
    let weatherInterval = null;
    let locationWatcher = null;

    const fetchData = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const updateWeatherData = async (lat, lon) => {
        const URL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely&appid=${API_key}`;
        axios
          .get(URL)
          .then((response) => {
            setCurrentWeather(response.data.current);
          })
          .catch((error) => console.error(error));
      };

      const updateWifi = NetInfo.addEventListener((state) => {
        if (state.type === "wifi") {
          setIsWifi(true);
        } else {
          setIsWifi(false);
        }
      });

      locationWatcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (location) => {
          const { latitude, longitude } = location.coords;
          setGpsAccuracy(location.coords.accuracy);
          // console.log(`GPS accuracy: ${location.coords.accuracy} meters`);

          // Update weather data immediately upon location change
          if (!weatherInterval) {
            updateWeatherData(latitude, longitude);
          }
          updateWifi();

          // Schedule weather updates every minute
          if (weatherInterval) {
            clearInterval(weatherInterval);
          }
          weatherInterval = setInterval(() => updateWeatherData(latitude, longitude), 60000 * 60);
        }
      );

      return () => {
        if (weatherInterval) {
          clearInterval(weatherInterval);
        }
        if (locationWatcher) {
          locationWatcher.remove();
        }
      };
    };

    fetchData();
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      if (currentWeather !== null && gpsAccuracy !== null) {
        const weatherID = currentWeather.weather[0].id;
        let weatherIntensity = 0;
        let dayIntensity = 0;
        let gpsIntensity = 0;
        let wifiIntensity = 0;

        // Weather Intensity Algorithm
        // 참고: https://openweathermap.org/weather-conditions#Weather-Condition-Codes-2

        weatherIntensity = WeatherList[weatherID]?.intensity || 0;

        // Daylight Intensity Algorithm
        const sunriseTime = new Date(currentWeather.sunrise * 1000);
        const sunsetTime = new Date(currentWeather.sunset * 1000);
        const currentTime = new Date();

        // 계산을 위한 밀리초 단위로의 변환
        const sunriseMillis = sunriseTime.getTime();
        const sunsetMillis = sunsetTime.getTime();
        const currentMillis = currentTime.getTime();

        // 현재 시간이 일출 이전이거나 일몰 이후인 경우, dayIntensity를 0으로 설정
        if (currentMillis < sunriseMillis || currentMillis > sunsetMillis) {
          dayIntensity = 0;
        } else {
          // 일출부터 일몰까지의 총 시간 계산
          const totalDaylightMillis = sunsetMillis - sunriseMillis;

          // 현재 시간이 하루 중 어느 위치에 있는지 비율로 계산 (0부터 1까지)
          const proportionOfDaylight = (currentMillis - sunriseMillis) / totalDaylightMillis;

          dayIntensity = 80 * Math.sin(Math.PI * proportionOfDaylight) + 20;
          // dayIntensity = 80 * Math.sin(Math.PI * 0.5) + 20;
        }

        // GPS Intensity Algorithm
        if (gpsAccuracy <= 5) {
          gpsIntensity = 100;
        } else if (gpsAccuracy <= 7.5) {
          gpsIntensity = 75;
        } else if (gpsAccuracy <= 10) {
          gpsIntensity = 50;
        } else if (gpsAccuracy <= 15) {
          gpsIntensity = 10;
        } else if (gpsAccuracy <= 25) {
          gpsIntensity = 1;
        } else if (gpsAccuracy <= 50) {
          gpsIntensity = 0;
        }

        //Wifi Intensity Algorithm
        if (isWifi) {
          wifiIntensity = 20;
        } else {
          wifiIntensity = 70;
        }

        //console.log()
        // console.log(`weather : ${weatherIntensity}`);
        // console.log(`day light : ${dayIntensity}`);
        // console.log(`gps accuarcy : ${gpsIntensity}`);
        // console.log(`wifi connect : ${wifiIntensity}`);

        const sunEst = dayIntensity * gpsIntensity * weatherIntensity * wifiIntensity * 0.00000001;

        //Updating progress
        setProgress((prevProgress) => {
          const newProgress = prevProgress + sunEst * 0.01 * 10;
          console.log(sunEst * 10);
          // Check if progress is complete and clear the interval if needed
          if (newProgress >= 1) {
            clearInterval(progressInterval);
            setCompleted(true);
          }
          return newProgress > 1 ? 1 : newProgress;
        });
      }
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [currentWeather, gpsAccuracy, isWifi]);

  // //  카메라 test code
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProgress((oldProgress) => {
  //       if (oldProgress >= 0.9) {
  //         clearInterval(interval);
  //         setCompleted(true);
  //         return 1;
  //       }
  //       return oldProgress + 0.1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, []);

  return { progress, completed };
};

export default useSunDetector;

// 안쓰는 파트

// 로컬 날짜 변환 출력
// const sunriseLocalTime = sunriseTime.toLocaleTimeString();
// const sunsetLocalTime = sunsetTime.toLocaleTimeString();
// const currentLocalTime = currentTime.toLocaleTimeString();

// console.log("Sunrise time:", sunriseLocalTime);
// console.log("Sunset time:", sunsetLocalTime);
// console.log("Current time:", currentLocalTime);

//가중치 기반 계산법

// Weights for each factor
// const weatherWeight = 2; // importance
// const dayWeight = 1; // importance
// const gpsWeight = 3; // importance
// const wifiWeight = 2; // importance

// Sun Estimation
// const sunEst =
//   (gpsWeight * gpsIntensity +
//     weatherWeight * weatherIntensity +
//     dayWeight * dayIntensity +
//     wifiWeight * wifiIntensity) /
//   (gpsWeight + weatherWeight + dayWeight + wifiWeight);

// Check dayIntensity and gpsIntensity before updating progress
// if (dayIntensity > 0 && gpsIntensity > 0 && weatherIntensity > 0) {
//   setProgress((prevProgress) => {
//     const newProgress = prevProgress + sunEst * 0.00001 * 100;
//     console.log(sunEst * 0.000001 * 100);
//     return newProgress > 1 ? 1 : newProgress; // Ensure progress doesn't exceed 1 (or 100%)
//   });
// }
