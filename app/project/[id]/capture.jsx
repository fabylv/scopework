import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
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
import { getPhotos } from "../../../lib/api/photos";

/**
 * Photo capture / upload screen.
 * On iOS/Android: opens native camera or picker.
 * On web: Expo falls back to a file input automatically.
 */
export default function CaptureScreen() {
  const { id: projectId } = useLocalSearchParams();
  const router = useRouter();
  const { analyze, isUploading } = usePhotoAnalysis(projectId);

  const [photos, setPhotos] = useState([]);
  const [uploadingCount, setUploadingCount] = useState(0);

  async function requestPermissions() {
    if (Platform.OS === "web") return true; // web uses file input, no permissions needed
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission",
        "RepairIQ needs camera access to capture repair photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  }

  async function handleCamera() {
    const ok = await requestPermissions();
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.length > 0) {
      await processAsset(result.assets[0]);
    }
  }

  async function handlePicker() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets?.length > 0) {
      for (const asset of result.assets) {
        await processAsset(asset);
      }
    }
  }

  async function processAsset(asset) {
    const optimisticPhoto = {
      id: `temp-${Date.now()}-${Math.random()}`,
      public_url: asset.uri,
      status: "pending",
    };
    setPhotos((prev) => [optimisticPhoto, ...prev]);
    setUploadingCount((c) => c + 1);

    try {
      // Swap status to "analyzing" after upload completes
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === optimisticPhoto.id ? { ...p, status: "analyzing" } : p
        )
      );
      const uploaded = await analyze({
        uri: asset.uri,
        fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? "image/jpeg",
      });
      // Replace optimistic entry with real DB record
      setPhotos((prev) =>
        prev.map((p) => (p.id === optimisticPhoto.id ? { ...uploaded, status: "analyzing" } : p))
      );
    } catch (err) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === optimisticPhoto.id ? { ...p, status: "error" } : p
        )
      );
      Alert.alert("Upload Failed", err?.message ?? "Could not upload photo.");
    } finally {
      setUploadingCount((c) => c - 1);
    }
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <View className="bg-brand-dark px-5 pt-14 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-brand-amber text-sm font-medium">← Back to Report</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Capture Photos</Text>
        <Text className="text-sm text-gray-400 mt-0.5">
          {uploadingCount > 0
            ? `Uploading ${uploadingCount} photo${uploadingCount !== 1 ? "s" : ""}…`
            : "Take or upload photos to analyze repairs"}
        </Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row gap-3 px-4 pt-4">
        {/* Hide camera button on web — ImagePicker handles it via file input in picker */}
        {Platform.OS !== "web" && (
          <TouchableOpacity
            onPress={handleCamera}
            disabled={isUploading}
            className="flex-1 bg-brand-amber rounded-xl py-4 items-center"
            activeOpacity={0.85}
          >
            <Text className="text-white font-semibold text-base">📷 Camera</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handlePicker}
          disabled={isUploading}
          className="flex-1 bg-white border border-brand-border rounded-xl py-4 items-center"
          activeOpacity={0.85}
        >
          <Text className="text-brand-dark font-semibold text-base">
            {Platform.OS === "web" ? "📁 Upload Photos" : "🖼 Library"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status hint */}
      <View className="mx-4 mt-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Text className="text-xs text-yellow-800">
          💡 AI analyzes each photo individually — get close to repair areas for best results.
        </Text>
      </View>

      {/* Photo grid */}
      {photos.length > 0 ? (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          className="mt-4"
          renderItem={({ item }) => <PhotoTile photo={item} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center gap-2 pb-24">
          <Text className="text-4xl">📸</Text>
          <Text className="text-base font-semibold text-brand-dark mt-2">
            No photos yet
          </Text>
          <Text className="text-sm text-brand-muted text-center px-8">
            Add photos above and RepairIQ will detect repair issues automatically.
          </Text>
        </View>
      )}
    </View>
  );
}
