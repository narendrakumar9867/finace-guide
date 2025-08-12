import React, { useRef, useEffect } from "react";
import { Text, Image, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeScreen() {

  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#f8f9ff", "#f5e9deff", "#c5cbd9ff"]}
      style={styles.container}
    >
      <Image
        source={require("../../assets/images/home-page.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Animated.Text
        style={[
          styles.title,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >Easy way to {"\n"}Manage your {"\n"}Money
      </Animated.Text>

      <Text style={styles.subtitle}>
        Finance Guide is an AI-powered, mobile-first {"\n"}
        finance tracker that helps Clients {"\n"} 
        and Senders manage loans {"\n"}
        and track installments. 
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/otp-mobile-number")}
      >
        <Text style={styles.buttonText} >Get Started</Text>
        <AntDesign name="arrowright" size={22} color="black" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 300,
    height: 350,
    marginTop: -160,
  },
  title: {
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "left",
    color: "#323131ff",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "left",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 4 },
    shadowRadius: 5,
    elevation: 4,
    marginBottom: -120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 16,
    alignContent: "flex-start",
  },
});
