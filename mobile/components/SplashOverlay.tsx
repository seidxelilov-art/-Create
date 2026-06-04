import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

const SPLASH_IMAGE = require("../assets/splash-screen.jpeg");

interface SplashOverlayProps {
  onDone: () => void;
}

export function SplashOverlay({ onDone }: SplashOverlayProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Animated.Image
        source={SPLASH_IMAGE}
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
    width,
    height,
  },
});
