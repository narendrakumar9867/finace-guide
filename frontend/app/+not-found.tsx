import { Link, Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';

export default function PageNotFound() {
  return (
    <>
    <Stack.Screen options={{
      title: "Oops! page is not found."
    }} />
    <View
      style={styles.container}
    >
      <Link href={"/"} style={styles.button}>Go to Home Screen!!</Link>
    </View>
    </>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
  },
  text: { color: "#ffffff"} ,
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#ffffff"
  }
}) 

