import { Stack } from "expo-router";
import { LogBox, StatusBar as RNStatusBar, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <>
      {/* Cross-platform status bar */}
      <StatusBar style="dark" hidden={false} translucent={false} />

      {/* Android ke liye native control */}
      {Platform.OS === "android" && (
        <RNStatusBar
          backgroundColor="#ffffff"
          barStyle="dark-content"
          translucent={false}
        />
      )}

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
