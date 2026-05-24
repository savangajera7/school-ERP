import React, { useEffect } from "react";
import { router } from "expo-router";
import { View, StyleSheet, Text, Image, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get('window');

export default function EntryPoint() {
  useEffect(() => {
    console.log("EntryPoint mounted");
    const timer = setTimeout(() => {
      console.log("Navigating to login...");
      try {
        router.replace("/(auth)/login");
      } catch (error) {
        console.error("Navigation error:", error);
      }
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient 
      colors={[Colors.gradientStart, Colors.gradientEnd]} 
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/school-logo.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.title}>Little Angel's</Text>
        <Text style={styles.schoolName}>English School</Text>
        
        <TouchableOpacity 
          style={{ marginTop: 40, padding: 15, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continue to Login</Text>
        </TouchableOpacity>

        <View style={styles.loaderContainer}>
          <PremiumLoader color="#ffffff" size={40} />
        </View>
      </View>
      
      <Text style={styles.footer}>SCHOOL ERP • SMART MANAGEMENT</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#fff',
    borderRadius: 75,
    padding: 10,
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: -4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 16,
    fontWeight: '600',
  },
  loaderContainer: {
    marginTop: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  }
});
