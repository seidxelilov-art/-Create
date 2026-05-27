import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
} from "react-native";
import Svg, { Circle, ClipPath, Defs, Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const BG = "#0d7a62";
const ARC_COLOR = "rgba(255,255,255,0.9)";
const ARC_DIM = "rgba(255,255,255,0.22)";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface SplashOverlayProps {
  onDone: () => void;
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function RadarLogo({ size }: { size: number }) {
  const cx = size / 2;
  const cy = size * 0.56;
  const radii = [0.14, 0.22, 0.3, 0.38, 0.46].map((r) => r * size);
  const sw = size * 0.028;

  const arc0 = useRef(new Animated.Value(0)).current;
  const arc1 = useRef(new Animated.Value(0)).current;
  const arc2 = useRef(new Animated.Value(0)).current;
  const arc3 = useRef(new Animated.Value(0)).current;
  const arc4 = useRef(new Animated.Value(0)).current;
  const arcAnims = [arc0, arc1, arc2, arc3, arc4];

  const needleRot = useRef(new Animated.Value(-55)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    arcAnims.forEach((anim, i) => {
      Animated.sequence([
        Animated.delay(200 + i * 130),
        Animated.timing(anim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(needleRot, {
        toValue: 15,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const needleRotStr = needleRot.interpolate({
    inputRange: [-180, 180],
    outputRange: ["-180deg", "180deg"],
  });

  const upperClipPath = `M 0 ${cy} L ${size} ${cy} L ${size} 0 L 0 0 Z`;
  const lowerClipPath = `M 0 ${cy} L ${size} ${cy} L ${size} ${size} L 0 ${size} Z`;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        opacity: logoOpacity,
        transform: [{ scale: logoScale }],
      }}
    >
      {/* Dim background arcs */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject as any}>
        <Defs>
          <ClipPath id="upper"><Path d={upperClipPath} /></ClipPath>
          <ClipPath id="lower"><Path d={lowerClipPath} /></ClipPath>
        </Defs>
        {radii.map((r, i) => (
          <React.Fragment key={i}>
            <Path d={arcPath(cx, cy, r, -180, 0)} stroke={ARC_DIM} strokeWidth={sw} fill="none" strokeLinecap="round" clipPath="url(#upper)" />
            <Path d={arcPath(cx, cy, r, 0, 80)} stroke={ARC_DIM} strokeWidth={sw} fill="none" strokeLinecap="round" clipPath="url(#lower)" />
          </React.Fragment>
        ))}
      </Svg>

      {/* Animated bright arcs */}
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject as any}>
        <Defs>
          <ClipPath id="upper2"><Path d={upperClipPath} /></ClipPath>
        </Defs>
        {radii.map((r, i) => (
          <AnimatedPath
            key={i}
            d={arcPath(cx, cy, r, -180, 0)}
            stroke={ARC_COLOR}
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
            clipPath="url(#upper2)"
            opacity={arcAnims[i] as any}
          />
        ))}
      </Svg>

      {/* Needle */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            transform: [
              { translateX: cx },
              { translateY: cy },
              { rotate: needleRotStr },
              { translateX: -cx },
              { translateY: -cy },
            ],
          },
        ]}
      >
        <Svg width={size} height={size}>
          <Path
            d={`M ${cx} ${cy} L ${cx + size * 0.012} ${cy - size * 0.3} L ${cx} ${cy - size * 0.36} L ${cx - size * 0.012} ${cy - size * 0.3} Z`}
            fill="white"
            opacity={0.95}
          />
          <Circle cx={cx} cy={cy} r={size * 0.025} fill="white" />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

export function SplashOverlay({ onDone }: SplashOverlayProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: Platform.OS !== "web",
      }).start(() => onDone());
    }, 2700);

    return () => clearTimeout(hideTimer);
  }, []);

  const logoSize = Math.min(width, height) * 0.52;

  return (
    <Animated.View
      style={[styles.container, { opacity: containerOpacity }]}
      pointerEvents="none"
    >
      <RadarLogo size={logoSize} />

      <Animated.Text
        style={[
          styles.title,
          { opacity: textOpacity, transform: [{ translateY: textY }] },
        ]}
      >
        SMSRadar
      </Animated.Text>
      <Animated.Text
        style={[
          styles.subtitle,
          { opacity: textOpacity, transform: [{ translateY: textY }] },
        ]}
      >
        Cərimə İzləmə Sistemi
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
});
