import { useRouter, useSegments } from "expo-router";
import { Platform, Text, TouchableOpacity, View } from "react-native";

const TABS = [
  { label: "Projects",     emoji: "🏠", route: "/(tabs)/dashboard"    },
  { label: "Contractors",  emoji: "🔧", route: "/(tabs)/contractors"  },
  { label: "Account",      emoji: "👤", route: "/(tabs)/account"      },
];

/**
 * Persistent bottom nav bar — mirrors the Tabs layout for screens that live
 * outside the (tabs) group (e.g. project detail, capture).
 */
export default function BottomNav() {
  const router   = useRouter();
  const segments = useSegments();

  // Derive which tab (if any) is "active" based on current route
  const activeRoute = "/" + segments.join("/");

  return (
    <View
      style={{
        flexDirection:    "row",
        backgroundColor:  "#1E2530",
        borderTopWidth:   1,
        borderTopColor:   "#2E3540",
        paddingBottom:    Platform.OS === "ios" ? 20 : 8,
        paddingTop:       8,
      }}
    >
      {TABS.map(({ label, emoji, route }) => {
        const active = activeRoute.includes(route.replace("/(tabs)/", ""));
        return (
          <TouchableOpacity
            key={route}
            onPress={() => router.replace(route)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: "center", gap: 3 }}
          >
            <Text style={{ fontSize: 20, opacity: active ? 1 : 0.5 }}>{emoji}</Text>
            <Text
              style={{
                fontSize:   11,
                fontWeight: "600",
                color:      active ? "#FFA12B" : "#9CA3AF",
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
