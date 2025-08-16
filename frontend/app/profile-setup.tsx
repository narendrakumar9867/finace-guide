import { memo, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Platform, Alert } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

const profileSetup = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const year = selectedDate.getFullYear();
      setDob(`${day}-${month}-${year}`);
    }
  };

  const formateAadhar = (text: string) => {
    let digits = "";

    for (let i = 0; i < text.length; i++) {
      if (text[i] >= "0" && text[i] <= "9") {
        digits += text[i];
      }
    }

    let formatted = "";

    for (let i = 0; i < digits.length; i++) {
      formatted += digits[i];

      if ((i + 1) % 4 === 0 && i !== digits.length - 1) {
        formatted += "-";
      }
    }

    setAadharNumber(formatted);
  };

  const handleVerify = () => {
    let rawDigits = "";

    for (let i = 0; i < aadharNumber.length; i++) {
      const ch = aadharNumber[i];
      if (ch >= "0" && ch <= "9") {
        rawDigits += ch;
      }
    }

    if (rawDigits.length !== 12) {
      Alert.alert("Error", "please enter 16 digit aadhar number.");
      return;
    }

    router.push({
      pathname: "/otp-aadhar",
      params: { AadharNumberFull: rawDigits },
    });
  };

  return (
    <View style={styles.container}>

      <View style={styles.arrowContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333"/>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.imageContainer}>
        <Ionicons name="camera-outline" size={32} color="#666" />
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Username"
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Aadhar Number</Text>
      <View style={styles.aadharContainer}>
        <TextInput
          style={styles.aadharInput}
          keyboardType="phone-pad"
          placeholder="1234-5678-1234-5678"
          value={aadharNumber}
          maxLength={14}
          onChangeText={formateAadhar}
        />

        <TouchableOpacity activeOpacity={0.8} onPress={handleVerify}>
          <LinearGradient
            colors={["#4960F9", "#5264F9"]}
            start={{ x: 0, y: 0}}
            end={{ x: 1, y: 1}}
            style={styles.verifyButton}
          >
            <Text style={styles.verifyText}>Verify</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.optionsContainer}>
        {["Male", "Female"].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.option,
              gender === option && styles.selectedOption
            ]}
            onPress={() => setGender(option)}
          >
            <Text
              style={[
                styles.optionText,
                gender === option && styles.selectedOptionText
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Your birthday (dd-mm-yyyy)"
          value={dob}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

        {showPicker && (
            <DateTimePicker
            value={
                dob
                ? (() => {
                    const [day, month, year] = dob.split("-").map(Number);
                    return new Date(year, month - 1, day);
                    })()
                : new Date()
            }
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChange}
            />
        )}

      <Text style={styles.infoText}>
        Please make sure above information{"\n"} are correct.
      </Text>

      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => {
          if ( !username.trim() || !aadharNumber.trim() || !gender.trim() || !dob.trim()) {
            alert("please complete required fields.");
              return;
          }
          router.push({
            pathname: "/home-page"
          });
        }}>
          <LinearGradient
            colors={["#4960F9", "#5264F9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
          <Text style={styles.buttonText} >Save</Text>
          </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  arrowContainer: {
    position: "absolute",
    top: 20,
    left: 10,
    zIndex: 1
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 10
  },
  aadharContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  aadharInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 5,
    fontSize: 14,
    marginTop: 5,
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5
  },
  selectedOption: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF"
  },
  optionText: {
    color: "#000",
  },
  selectedOptionText: {
    color: "#fff"
  },
  verifyButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
  },
  verifyText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "400",
  },
  imageContainer: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 40
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontWeight: "bold",
    marginTop: 10
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 5,
    fontSize: 14,
    marginBottom: 20,
    marginTop: 5,
    padding: 10,
    borderRadius: 8
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 30
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 50,
    marginTop: 20
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 16,
    color: "#fff"
  }
});

export default memo(profileSetup);