import { Stack } from "expo-router"
import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />  {/* for the app mobile status bar to convert light color */}
      <Stack>
        <Stack.Screen 
          name="(tabs)" // index is file name so it redirect this page
          options={{
            headerShown: false,
          }}
          />
        <Stack.Screen
          name="+not-found"
          options={{}}
        />
      </Stack>
    </>
  );
}

