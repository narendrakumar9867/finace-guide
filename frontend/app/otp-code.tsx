import { memo, useState, useRef } from 'react';
import {Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const OtpMobileNumber = () => {

    const router = useRouter();
    const { mobileNumber } = useLocalSearchParams();

    const [ otp, setOtp] = useState(["", "", "", ""]);
    const inputsRef = useRef<(TextInput | null)[]>([]);

    const handleChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < otp.length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== "");

    return (

      <View style={styles.container}>

        <View style={styles.arrowcontainer}>
          <TouchableOpacity style={styles.backbutton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
            OTP Verification
        </Text>

        <Text style={styles.subtitle}>
            Enter the OTP sent to {"\n"}
            +91 {mobileNumber}
        </Text>

        <View style={styles.container1}>
            {otp.map((digit, index) => (
                <TextInput
                key={index}
                style={styles.input}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                ref={(el) => (inputsRef.current[index] = el)}
                />
            ))}
        </View>
        
        <Text style={styles.subsubtitle}>
            Didn’t receive OTP?
            <Text style={{ color: "#007BFF", fontWeight: "bold"}}> Resend OTP</Text>
        </Text>

        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.shadow} 
          onPress={() => {
            if (!isOtpComplete) {
              alert("please enter 4 digit code.");
              return;
            }
            router.push("/profile-setup");
          }}>
            <LinearGradient
              colors={["#4960F9", "#5264F9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
            <Text style={styles.buttonText} >Verify</Text>
            <AntDesign name="checkcircle" size={22} color="black" />
            </LinearGradient>
        </TouchableOpacity>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  arrowcontainer: {
    position: "absolute",
    top: 25,
    left: 20,
    zIndex: 1
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 10
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000ff",
    marginTop: 0,
    marginBottom: 40
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
    paddingHorizontal: 10
  },
  subsubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    paddingHorizontal: 10
  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    alignSelf: "center"
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "blue",
    textAlign: "center",
    fontSize: 20,
    width: 40,
    color: "#000000ff",
    marginBottom: 20
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
    borderRadius: 50,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 16,
    color: "#fff"
  }
});

export default memo(OtpMobileNumber);