import React, { useEffect, useRef } from "react";
import { Animated, Image, Platform, StyleSheet } from "react-native";

interface SplashOverlayProps {
  onDone: () => void;
}

export function SplashOverlay({ onDone }: SplashOverlayProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: Platform.OS !== "web",
      }).start(() => onDone());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Image
        source={require("../assets/images/splash_logo.jpg")}
        style={styles.image}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
