import { useState, useEffect } from "react";
import { DeviceMotion } from "expo-sensors";

const useSkyDirectionFinder = () => {
  const [isFacingUpwards, setIsFacingUpwards] = useState(false);

  useEffect(() => {
    let subscription;
    DeviceMotion.setUpdateInterval(500); // adjust as needed
    subscription = DeviceMotion.addListener((motionData) => {
      const { x, y, z } = motionData.accelerationIncludingGravity;
      //console.log(`x: ${x}, y: ${y}, z: ${z}`);

      if (z > 8 && Math.abs(x) < 9 && Math.abs(y) < 9) {
        setIsFacingUpwards(true);
      } else {
        setIsFacingUpwards(false);
      }
    });
    return () => {
      subscription && subscription.remove();
    };
  }, []);

  return isFacingUpwards;
};

export default useSkyDirectionFinder;
