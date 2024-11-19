import { Stack } from "expo-router";
import AuthProvider from "../providers/AuthProvider";
import { PropsWithChildren } from "react";
import { View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { colors } from "../theme/colors";

export default function MainLayout() {

  const RootView = ({ children }: PropsWithChildren) => {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor={colors.primaryContainer} style='dark' />
        {children}
      </View>
    );
  };

  return (
    <RootView>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(root)" />
        </Stack>
      </AuthProvider>
    </RootView>
  );
}
