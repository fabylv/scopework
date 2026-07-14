import { Tabs } from 'expo-router';
import { View } from 'react-native';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#151C24', borderTopColor: '#222B36', height: 60 },
        tabBarActiveTintColor: '#FFA12B',
        tabBarInactiveTintColor: '#5A6270',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: color }} /> }} />
      <Tabs.Screen name="new-project" options={{ title: 'New', tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }} /> }} />
      <Tabs.Screen name="contractors" options={{ title: 'Contractors', tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: color }} /> }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ({ color }) => <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: color }} /> }} />
    </Tabs>
  );
}
