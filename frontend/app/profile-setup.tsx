import { memo, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

const profileSetup = () => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

  return (
    <View style={styles.container}>

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

      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your First Name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Last Name"
        value={lastName}
        onChangeText={setLastName}
      />

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
            if ( !username.trim() || !firstName.trim() || !lastName.trim() || !dob.trim()) {
                alert("please complete required fields.");
                return;
            }
            router.push("/home-page");
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
