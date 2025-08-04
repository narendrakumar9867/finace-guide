import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ffd33d",
        headerStyle: {
            backgroundColor: "#25292e",
        },
        headerShadowVisible: false,
        headerTintColor: "#fff",
        tabBarStyle: {
            backgroundColor: "#25292e"
        }
      }}
    >
      <Tabs.Screen 
        name="index" // index is file name so it redirect this page
        options={{
          headerTitle: "narendra kumar",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={30} 
            />
          ),
        }}
        />
      <Tabs.Screen 
        name="about"// about is file name so it redirect this page
        options={{
          headerTitle: "About",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "information-circle" : "information-outline"}
              color={color}
              size={30} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="+not-found"
        options={{}}
      />
    </Tabs>
  );
}

