import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import PhotoTile from "../../../components/PhotoTile";
import { usePhotoAnalysis } from "../../../hooks/usePhotoAnalysis";

export default function CaptureScreen() {
  const { id: projectId } = useLocalSearchParams();
  const router = useRouter();
  const { analyze, isUploading } = usePhotoAnalysis(projectId);

  const [photos, setPhotos] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  async function requestCameraPerms() {
    if (Platform.OS === "web") return true;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Access", "RepairIQ needs camera access to capture repair photos.");
      return false;
    }
    return true;
  }

  async function handleCamera() {
    if (!(await requestCameraPerms())) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled) await processAssets(result.assets);
  }

  async function handlePicker() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    if (!result.canceled) await processAssets(result.assets);
  }

  async function processAssets(assets) {
    for (const asset of assets) {
      const temp = { id: `tmp-${Date.now()}-${Math.random()}`, public_url: asset.uri, status: "pending" };
      setPhotos((p) => [temp, ...p]);
      setPendingCount((c) => c + 1);

      try {
        setPhotos((p) => p.map((x) => x.id === temp.id ? { ...x, status: "analyzing" } : x));
        const uploaded = await analyze({
          uri: asset.uri,
          fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
          mimeType: asset.mimeType ?? "image/jpeg",
        });
        setPhotos((p) => p.map((x) => x.id === temp.id ? { ...uploaded, status: "analyzing" } : x));
      } catch (err) {
        setPhotos((p) => p.map((x) => x.id === temp.id ? { ...x, status: "error" } : x));
        Alert.alert("Upload Failed", err?.message ?? "Could not upload this photo.");
      } finally {
        setPendingCount((c) => c - 1);
      }
    }
  }

  const isActive = pendingCount > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: "#12161F" }}>
      {/* Header */}
      <LinearGradient colors={["#1A1F2E", "#12161F"]} style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text style={{ color: "#F59E0B", fontSize: 14, fontWeight: "600" }}>← Back to Report</Text>
        </TouchableOpacity>
        <View className="flex-row items-center justify-between">
          <View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>Capture Photos</Text>
            <Text style={{ color: isActive ? "#F59E0B" : "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 3 }}>
              {isActive
                ? `⏳ Processing ${pendingCount} photo${pendingCount !== 1 ? "s" : ""}…`
                : `${photos.length} photo${photos.length !== 1 ? "s" : ""} captured`}
            </Text>
          </View>
          {isActive && (
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(245,158,11,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18 }}>⏳</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>
        {Platform.OS !== "web" && (
          <TouchableOpacity
            onPress={handleCamera}
            disabled={isUploading}
            activeOpacity={0.85}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 20, paddingVertical: 18, alignItems: "center" }}
            >
              <Text style={{ fontSize: 22 }}>📷</Text>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13, marginTop: 4 }}>Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handlePicker}
          disabled={isUploading}
          activeOpacity={0.85}
          style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, paddingVertical: 18, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}
        >
          <Text style={{ fontSize: 22 }}>{Platform.OS === "web" ? "📁" : "🖼️"}</Text>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13, marginTop: 4 }}>
            {Platform.OS === "web" ? "Upload" : "Library"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AI tip */}
      <View style={{ marginHorizontal: 16, marginBottom: 16, backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.25)" }}>
        <Text style={{ color: "#F59E0B", fontSize: 12, fontWeight: "600" }}>
          💡 AI Tip — Get close to repair areas. One issue per shot works best.
        </Text>
      </View>

      {/* Photo grid or empty state */}
      {photos.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 }}>
          <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 44 }}>📸</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>No photos yet</Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginTop: 6, paddingHorizontal: 40, lineHeight: 20 }}>
            Use the buttons above to capture or upload photos of repair areas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ padding: 8, paddingBottom: 48 }}
          renderItem={({ item }) => <PhotoTile photo={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
