// Process-Camera.js
import React, { useEffect, useState, useRef, useContext } from "react";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import * as Progress from "react-native-progress";
import ConfettiCannon from "react-native-confetti-cannon";
import { Camera } from "expo-camera";
import useSkyDirectionFinder from "./SkyDirectionFinder";
import useSunDetector from "./SunDetector"; // import our custom hook here
import { createPost } from "../database/FirebaseAuth"; // 필요한 함수를 임포트합니다.
import Geocoder from "react-native-geocoding";
import { UserContext } from "../database/UserContext";

const { width, height } = Dimensions.get("window");

const ProgressBar = () => {
  const { progress, completed } = useSunDetector();
  const [activateParticle, setActivateParticle] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraProgressing, setCameraProgressing] = useState(false);
  const [skylogCaption, setSkylogCaption] = useState("");
  const { user, location } = useContext(UserContext); // UserContext에서 위치 정보 가져오기
  const [address, setAddress] = useState(null); // 주소 상태 추가
  const isFacingUpwards = useSkyDirectionFinder();
  // const isFacingUpwards = true; // test code
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      // 위치 정보가 있으면 Geocoder로 주소로 변환
      if (location) {
        Geocoder.init("AIzaSyBn4_Xwd9CZbXXPqSuToZpIPgN0YTs_xSA"); // Geocoding API key

        const { latitude, longitude } = location;

        // Geocoder로 주소로 변환
        Geocoder.from(latitude, longitude)
          .then((json) => {
            const addressComponent = json.results[0].formatted_address;
            setAddress(addressComponent); // 주소 상태 업데이트
          })
          .catch((error) => console.warn(error));
      }
    })();
  }, [user]); // user가 변경될 때마다 재실행

  const handleAnimationEnd = () => {
    setActivateParticle(false);
  };

  const handleMinimize = () => {
    setMinimized(!minimized);
  };

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setCameraVisible(true);
      console.log(`Camera visibility changed: ${cameraVisible}`);
    } else {
      Alert.alert(
        "Camera Permission Required",
        "Please grant camera permission to use this feature.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
    }
  };

  const closeCamera = () => {
    setCameraVisible(false);
    setCapturedPhoto(null);
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        setCameraProgressing(true); // Begin taking photo
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedPhoto(photo);
      } catch (error) {
        console.log("Error capturing photo:", error);
      } finally {
        setCameraProgressing(false); //End taking photo
      }
    }
  };

  const retryCamera = () => {
    setCapturedPhoto(null);
  };

  const uploadSkylog = async () => {
    if (!capturedPhoto) {
      return;
    }
    try {
      // fetch API를 사용하여 이미지를 blob으로 가져옵니다.
      const response = await fetch(capturedPhoto.uri);
      const blob = await response.blob();

      // Firebase에 사진을 업로드하고 게시물을 생성합니다.
      const postData = {
        caption: skylogCaption, // 실제 앱에서는 사용자가 입력한 캡션을 사용해야 합니다.
        location: address,
        // 필요한 추가 데이터를 이곳에 작성합니다.
      };
      const successful = await createPost(postData, blob);

      if (successful) {
        Alert.alert("Success!", "Your skylog has been uploaded.");
      } else {
        Alert.alert("Error!", "Could not upload the skylog.");
      }
    } catch (error) {
      Alert.alert("Error!", "Could not upload the image.");
      console.error(error);
    }

    // 카메라를 닫습니다.
    closeCamera();
  };

  return (
    <View style={styles.container}>
      <Progress.Bar
        style={{ marginTop: 5 }}
        progress={progress}
        width={300}
        color="#AEDDFF"
        borderColor="#0099FF"
      />
      <Text>{Math.floor(progress * 100)}%</Text>

      {completed && minimized && (
        <TouchableOpacity style={styles.minimize} onPress={handleMinimize}>
          <Text>▽</Text>
        </TouchableOpacity>
      )}

      {completed && !minimized && (
        <>
          <Text>Congratulations! You did it!</Text>
          <TouchableOpacity style={styles.opencamera} onPress={openCamera}>
            <Text style={{ color: "#0099FF" }}>Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.minimize} onPress={handleMinimize}>
            <Text>△</Text>
          </TouchableOpacity>
        </>
      )}

      {completed && activateParticle && (
        <View style={styles.congratulation}>
          <ConfettiCannon
            count={300}
            origin={{ x: width / 2, y: 0 }}
            explosionSpeed={300}
            fallSpeed={1600}
            onAnimationEnd={handleAnimationEnd}
          />
        </View>
      )}

      {cameraVisible && (
        <>
          <View style={styles.camerabackground}></View>
          <View style={styles.cameraframe}>
            <TouchableOpacity style={styles.closecamera} onPress={closeCamera}>
              <Text>cancel</Text>
            </TouchableOpacity>
            <View style={styles.cameranotice}>
              <Text>Take a photo of your sky now</Text>
            </View>
            <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef}>
              {cameraProgressing && (
                <Text style={{ position: "absolute", bottom: 10, color: "white", zIndex: 1 }}>
                  Processing...
                </Text>
              )}
              {capturedPhoto && (
                <>
                  <Image source={{ uri: capturedPhoto.uri }} style={styles.capturedPhoto} />
                </>
              )}
            </Camera>

            {!capturedPhoto && !isFacingUpwards && (
              <Text
                style={{
                  color: "white",
                }}
              >
                Raise your phone to the sky
              </Text>
            )}

            {!capturedPhoto && isFacingUpwards && (
              <TouchableOpacity style={styles.takephoto} onPress={takePhoto}>
                <Text>Take photo</Text>
              </TouchableOpacity>
            )}

            {capturedPhoto && (
              <TouchableOpacity style={styles.retryphoto} onPress={retryCamera}>
                <Text>Retry</Text>
              </TouchableOpacity>
            )}

            {capturedPhoto && (
              <>
                <View style={styles.caption}>
                  <TextInput
                    placeholder="Enter your skylog caption"
                    onChangeText={setSkylogCaption}
                  />
                </View>
                <TouchableOpacity style={styles.upload} onPress={uploadSkylog}>
                  <Text>upload</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  congratulation: {
    position: "absolute",
    alignItems: "center",
    width: width,
    height: height,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  minimize: {
    width: 30,
    height: 20,
    // backgroundColor: "red",
    alignItems: "center",
  },
  opencamera: {
    width: 100,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  camerabackground: {
    backgroundColor: "#000000",
    position: "absolute",
    width: width,
    height: height,
    opacity: 0.8,
  },
  cameraframe: {
    flex: 1,
    top: -80,
    justifyContent: "center",
    alignItems: "center",
  },
  cameranotice: {
    backgroundColor: "white",
    top: 0,
    width: width - 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  camera: {
    width: width - 30,
    height: width - 30,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  closecamera: {
    backgroundColor: "red",
    zIndex: 2,
    marginBottom: 15,
  },
  takephoto: {
    backgroundColor: "green",
    marginBottom: 10,
  },
  retryphoto: {
    backgroundColor: "white",
    marginBottom: 10,
  },
  capturedPhoto: {
    position: "absolute",
    borderRadius: 10,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  caption: {
    backgroundColor: "white",
    top: 0,
    width: width - 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  upload: {
    backgroundColor: "#0099FF",
  },
});

export default ProgressBar;
