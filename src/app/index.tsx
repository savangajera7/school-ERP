import React, { useEffect } from "react";
import { router } from "expo-router";
import { View, StyleSheet, Text, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

const { width } = Dimensions.get('window');

export default function EntryPoint() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 2000); // Give it some time to show the nice splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient 
      colors={["#0d3666", "#1e40af"]} 
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require("../../assets/icon.png")} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </View>
        <Text style={styles.title}>School ERP</Text>
        <Text style={styles.subtitle}>Smart Management System</Text>
        
        <View style={styles.loaderContainer}>
          <PremiumLoader color="#ffffff" size={50} />
        </View>
      </View>
      
      <Text style={styles.footer}>Loading your experience...</Text>
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
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontWeight: '600',
  },
  loaderContainer: {
    marginTop: 60,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  }
});
