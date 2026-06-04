import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, ClipPath, Defs, Path, Polygon } from "react-native-svg";

const { width, height } = Dimensions.get("window");

interface SplashOverlayProps {
  onDone: () => void;
}

function toRad(d: number) {
  return (d * Math.PI) / 180;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

function RadarIcon({ size }: { size: number }) {
  const px = size * 0.3;
  const py = size * 0.68;
  const START = -108;
  const END   = -10;
  const radii = [0.20, 0.30, 0.40, 0.50].map(r => r * size);
  const sw = size * 0.06;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject as object}>
        {radii.map((r, i) => (
          <Path
            key={"dim" + i}
            d={arcPath(px, py, r, END, END + 70)}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </Svg>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject as object}>
        {radii.map((r, i) => (
          <Path
            key={"bright" + i}
            d={arcPath(px, py, r, START, END)}
            stroke="rgba(255,255,255,0.93)"
            strokeWidth={sw}
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </Svg>
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject as object}>
        <Path
          d={`M ${px} ${py} L ${px + size * 0.022} ${py - size * 0.20} L ${px} ${py - size * 0.48} L ${px - size * 0.022} ${py - size * 0.20} Z`}
          fill="white"
          opacity={0.95}
        />
        <Circle cx={px} cy={py} r={size * 0.038} fill="white" />
      </Svg>
    </View>
  );
}

function BottomTriangles() {
  const triW = 13;
  const triH = 10;
  const cols = 6;
  const rows = 4;
  const gap = 18;
  const svgH = rows * gap + triH;

  const tris: { key: string; pts: string; opacity: number }[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const lx = col * gap + 12;
      const ly = row * gap;
      const lo = Math.min(0.08 + (col + row) * 0.02, 0.22);
      tris.push({
        key: `l-${row}-${col}`,
        pts: `${lx},${ly + triH / 2} ${lx + triW},${ly} ${lx + triW},${ly + triH}`,
        opacity: lo,
      });
      const rx = width - (col * gap + 12 + triW);
      const ry = row * gap;
      const ro = Math.min(0.08 + (col + row) * 0.02, 0.22);
      tris.push({
        key: `r-${row}-${col}`,
        pts: `${rx + triW},${ry + triH / 2} ${rx},${ry} ${rx},${ry + triH}`,
        opacity: ro,
      });
    }
  }

  return (
    <View style={styles.triWrap}>
      <Svg width={width} height={svgH}>
        {tris.map(t => (
          <Polygon key={t.key} points={t.pts} fill={`rgba(255,255,255,${t.opacity})`} />
        ))}
      </Svg>
    </View>
  );
}

export function SplashOverlay({ onDone }: SplashOverlayProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity   = useRef(new Animated.Value(0)).current;
  const contentY         = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentY, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: Platform.OS !== "web",
      }).start(() => onDone());
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const iconSize = Math.min(width, height) * 0.38;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.root, { opacity: containerOpacity }]}
    >
      <LinearGradient
        colors={["#0a5c44", "#0a5c44"]}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["rgba(22,160,110,0.72)", "rgba(22,160,110,0.0)"]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["rgba(22,160,110,0.55)", "rgba(22,160,110,0.0)"]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0, y: 0.35 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["rgba(22,160,110,0.55)", "rgba(22,160,110,0.0)"]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 1, y: 0.35 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View
        style={[
          styles.center,
          { opacity: contentOpacity, transform: [{ translateY: contentY }] },
        ]}
      >
        <RadarIcon size={iconSize} />
        <View style={styles.textRow}>
          <Text style={styles.sms}>SMS</Text>
          <Text style={styles.radar}>RADAR</Text>
        </View>
      </Animated.View>

      <BottomTriangles />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    pointerEvents: "none" as any,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  textRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  sms: {
    fontSize: 28,
    fontWeight: "300",
    color: "rgba(255,255,255,0.80)",
    letterSpacing: 2.5,
  },
  radar: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 2.5,
  },
  triWrap: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
});
