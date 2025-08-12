import { memo, useState } from 'react';
import {Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const OtpMobileNumber = () => {

  const router = useRouter();

  const [mobile, setMobile] = useState("");
  return (

    <View style={styles.container}>
      <Text style={styles.title}>
        OTP Verification
      </Text>

      <Text style={styles.subtitle}>
        We will send you a one-time {"\n"}
        password on this mobile number
      </Text>

      <Text style={styles.subsubtitle}>
        Enter Mobile Number
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+91 11111 22222"
        placeholderTextColor="#9a9898ff"
        value={mobile}
        maxLength={10} 
        onChangeText={(text) => {
          const cleaned = text.replace(/[^0-9]/g, '');
          setMobile(cleaned);
        }}
      />

      <TouchableOpacity 
        activeOpacity={0.8} 
        style={styles.shadow} 
        onPress={() => {
          if (mobile.length !== 10) {
            alert("please enter 10 digit mobile number.");
            return;
          }
          router.push({
            pathname: "/otp-code",
            params: { mobileNumber: mobile }
          });
        }}>
        <LinearGradient
          colors={["#4960F9", "#5264F9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText} >Get OTP</Text>
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
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000ff",
    marginTop: 10,
    marginBottom: 40
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    paddingHorizontal: 10
  },
  subsubtitle: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
    paddingHorizontal: 10
  },
  input: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 6,
    width: "80%",
    marginBottom: 40
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