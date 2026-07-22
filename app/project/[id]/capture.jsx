import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePhotoAnalysis } from "../../../hooks/usePhotoAnalysis";
import { isMockMode } from "../../../lib/mockData";
import { shadows } from "../../../lib/shadow";

// ─── Mock AI analysis simulation ─────────────────────────────────────────────
const MOCK_ANALYSIS_RESULTS = [
  {
    quality: "good",
    issues: [
      { description: "Roof shingles cracked and lifting", category: "Roofing", severity: "high", estimated_cost: 3500 },
      { description: "Water stain on ceiling below roof", category: "Structural", severity: "medium", estimated_cost: 800 },
    ],
  },
  {
    quality: "poor",
    guidance: "Photo is too dark — move closer or turn on a light for a better shot.",
    issues: [],
  },
  {
    quality: "good",
    issues: [
      { description: "Mold visible behind bathroom tiles", category: "Plumbing", severity: "high", estimated_cost: 2200 },
    ],
  },
  {
    quality: "retake",
    guidance: "Too far away — get closer to the damaged area so I can see the details.",
    issues: [],
  },
  {
    quality: "good",
    issues: [
      { description: "HVAC filter clogged, unit needs service", category: "HVAC", severity: "medium", estimated_cost: 450 },
      { description: "Duct tape patch on vent — needs proper repair", category: "HVAC", severity: "low", estimated_cost: 120 },
    ],
  },
  {
    quality: "good",
    issues: [
      { description: "Cracked floor tiles near sink", category: "Flooring", severity: "low", estimated_cost: 300 },
    ],
  },
];

const SEVERITY_COLOR = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };
const SEVERITY_BG    = { high: "rgba(239,68,68,0.12)", medium: "rgba(245,158,11,0.12)", low: "rgba(16,185,129,0.12)" };
const CATEGORY_ICON  = { Roofing: "🏠", Plumbing: "🔧", Electrical: "⚡", HVAC: "❄️", Structural: "🏗️", Flooring: "🪵", Painting: "🎨", Other: "📋" };

let mockIndex = 0;
function getNextMockResult() {
  const result = MOCK_ANALYSIS_RESULTS[mockIndex % MOCK_ANALYSIS_RESULTS.length];
  mockIndex++;
  return result;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PhotoCard({ photo, onRetake }) {
  const isAnalyzing = photo.status === "analyzing";
  const isPoor      = photo.analysisResult?.quality === "poor" || photo.analysisResult?.quality === "retake";
  const isGood      = photo.analysisResult?.quality === "good";
  const issues      = photo.analysisResult?.issues ?? [];

  return (
    <View
      className="bg-white rounded-2xl overflow-hidden mb-3"
      style={shadows.dark}
    >
      {/* Photo + status overlay */}
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: photo.uri }}
          style={{ width: "100%", height: 180 }}
          resizeMode="cover"
        />

        {/* Analyzing pulse overlay */}
        {isAnalyzing && (
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(26,31,46,0.65)", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Text style={{ fontSize: 32 }}>🔍</Text>
            <Text style={{ color: "#F59E0B", fontWeight: "700", fontSize: 14 }}>Analyzing photo…</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>AI is detecting repair issues</Text>
          </View>
        )}

        {/* Quality warning banner */}
        {isPoor && (
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(239,68,68,0.92)", padding: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", flex: 1 }}>
              {photo.analysisResult?.guidance}
            </Text>
          </View>
        )}

        {/* Good quality tick */}
        {isGood && issues.length > 0 && (
          <View style={{ position: "absolute", top: 10, right: 10, backgroundColor: "rgba(16,185,129,0.9)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
              ✓ {issues.length} issue{issues.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        )}
      </View>

      {/* Issues list under photo */}
      {isGood && issues.length > 0 && (
        <View style={{ padding: 12, gap: 8 }}>
          {issues.map((issue, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: SEVERITY_BG[issue.severity], alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                <Text style={{ fontSize: 13 }}>{CATEGORY_ICON[issue.category] ?? "📋"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1F2E" }}>{issue.description}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                  <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: SEVERITY_BG[issue.severity] }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: SEVERITY_COLOR[issue.severity], textTransform: "uppercase" }}>{issue.severity}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>${issue.estimated_cost?.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Retake button for poor quality */}
      {isPoor && (
        <TouchableOpacity
          onPress={() => onRetake(photo.id)}
          style={{ margin: 12, marginTop: 8, backgroundColor: "#EF4444", borderRadius: 12, paddingVertical: 10, alignItems: "center" }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>📷 Retake Photo</Text>
        </TouchableOpacity>
      )}

      {/* No issues found */}
      {isGood && issues.length === 0 && (
        <View style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 16 }}>✅</Text>
          <Text style={{ fontSize: 13, color: "#64748B" }}>No visible repairs detected in this photo.</Text>
        </View>
      )}
    </View>
  );
}

function IssuesSummaryBar({ allIssues }) {
  if (allIssues.length === 0) return null;
  const total = allIssues.reduce((s, i) => s + (i.estimated_cost ?? 0), 0);

  return (
    <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
      <LinearGradient
        colors={["#1A1F2E", "#252C3D"]}
        style={{ borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center" }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Running Estimate</Text>
          <Text style={{ color: "#F59E0B", fontSize: 28, fontWeight: "800", marginTop: 2 }}>${total.toLocaleString()}</Text>
          <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
            {allIssues.length} issue{allIssues.length !== 1 ? "s" : ""} across {allIssues.filter((_, i, a) => a.findIndex(x => x.photoId === _.photoId) === i).length || 1} photo{allIssues.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={{ gap: 6 }}>
          {["high", "medium", "low"].map((sev) => {
            const count = allIssues.filter((i) => i.severity === sev).length;
            if (!count) return null;
            return (
              <View key={sev} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: SEVERITY_COLOR[sev] }} />
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  {count} {sev}
                </Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function CaptureScreen() {
  const { id: projectId } = useLocalSearchParams();
  const router = useRouter();
  const { analyze } = usePhotoAnalysis(projectId);

  const [photos, setPhotos] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  async function requestCameraPerms() {
    if (Platform.OS === "web") return true;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Access", "RepairIQ needs camera access to capture repair photos.");
      return false;
    }
    return true;
  }

  async function processAsset(asset) {
    const photoId = `photo-${Date.now()}-${Math.random()}`;
    const newPhoto = {
      id: photoId,
      uri: asset.uri,
      status: "analyzing",
      analysisResult: null,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setIsCapturing(false);

    try {
      let analysisResult;

      if (isMockMode()) {
        // Simulate 2–3 second AI analysis delay
        await new Promise((r) => setTimeout(r, 2500));
        analysisResult = getNextMockResult();
      } else {
        // Real upload + Edge Function
        const uploaded = await analyze({
          uri: asset.uri,
          fileName: asset.fileName ?? `photo-${Date.now()}.jpg`,
          mimeType: asset.mimeType ?? "image/jpeg",
        });
        analysisResult = uploaded?.analysis ?? { quality: "good", issues: [] };
      }

      setPhotos((prev) =>
        prev.map((p) => p.id === photoId ? { ...p, status: "done", analysisResult } : p)
      );

      // Add detected issues to the running list
      if (analysisResult.quality === "good" && analysisResult.issues?.length > 0) {
        setAllIssues((prev) => [
          ...prev,
          ...analysisResult.issues.map((issue) => ({ ...issue, photoId })),
        ]);
      }
    } catch (err) {
      setPhotos((prev) =>
        prev.map((p) => p.id === photoId ? { ...p, status: "error", analysisResult: { quality: "poor", guidance: "Upload failed — try again." } } : p)
      );
    }
  }

  async function handleCamera() {
    if (!(await requestCameraPerms())) return;
    setIsCapturing(true);
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled && result.assets?.length > 0) {
      await processAsset(result.assets[0]);
    } else {
      setIsCapturing(false);
    }
  }

  /** Read a File object as a base64 data URL (web only). */
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Open a file input on web and resolve with selected File objects. */
  function openWebFilePicker({ multiple = false, capture = false } = {}) {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      if (multiple) input.multiple = true;
      if (capture) input.capture = "environment";
      input.onchange = (e) => resolve(Array.from(e.target.files ?? []));
      input.oncancel = () => resolve([]);
      input.click();
    });
  }

  async function handlePicker() {
    if (Platform.OS === "web") {
      const files = await openWebFilePicker({ multiple: true });
      for (const file of files) {
        const uri = await readFileAsDataURL(file);
        await processAsset({ uri, fileName: file.name, mimeType: file.type });
      }
      return;
    }
    setIsCapturing(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });
    setIsCapturing(false);
    if (!result.canceled && result.assets?.length > 0) {
      for (const asset of result.assets) {
        await processAsset(asset);
      }
    }
  }

  async function handleWebCamera() {
    const files = await openWebFilePicker({ capture: true });
    if (files[0]) {
      const uri = await readFileAsDataURL(files[0]);
      await processAsset({ uri, fileName: files[0].name, mimeType: files[0].type });
    }
  }

  function handleRetake(photoId) {
    // Remove bad photo and open camera again
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    handleCamera();
  }

  const analyzing = photos.filter((p) => p.status === "analyzing").length;

  return (
    <View style={{ flex: 1, backgroundColor: "#12161F" }}>
      {/* Header */}
      <LinearGradient colors={["#1A1F2E", "#12161F"]}
        style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.replace(`/project/${projectId}`)} style={{ marginBottom: 12 }}>
          <Text style={{ color: "#F59E0B", fontSize: 14, fontWeight: "600" }}>← Back to Report</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>Capture Photos</Text>
            <Text style={{ color: analyzing > 0 ? "#F59E0B" : "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 3 }}>
              {analyzing > 0
                ? `🔍 Analyzing ${analyzing} photo${analyzing !== 1 ? "s" : ""}…`
                : photos.length === 0
                  ? "Walk the property and photograph each issue"
                  : `${photos.length} photo${photos.length !== 1 ? "s" : ""} · ${allIssues.length} issue${allIssues.length !== 1 ? "s" : ""} found`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Action buttons */}
      <View style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        {/* Camera button — native or web */}
        <TouchableOpacity
          onPress={Platform.OS === "web" ? handleWebCamera : handleCamera}
          disabled={isCapturing}
          activeOpacity={0.85}
          style={{ flex: 1 }}
        >
          <LinearGradient colors={["#F59E0B", "#D97706"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ borderRadius: 18, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
            <Text style={{ fontSize: 18 }}>📷</Text>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Camera</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Upload from gallery */}
        <TouchableOpacity onPress={handlePicker} disabled={isCapturing} activeOpacity={0.85}
          style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 18, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
          <Text style={{ fontSize: 18 }}>🖼️</Text>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* AI tip */}
      <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" }}>
        <Text style={{ color: "#F59E0B", fontSize: 12, fontWeight: "600", lineHeight: 18 }}>
          💡 Get close to each repair area — one issue per shot works best. The AI will tell you if a photo needs to be retaken.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Running cost estimate */}
        <IssuesSummaryBar allIssues={allIssues} />

        {/* Photo cards */}
        <View style={{ paddingHorizontal: 16 }}>
          {photos.length === 0 ? (
            <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 40, paddingBottom: 60 }}>
              <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 44 }}>📸</Text>
              </View>
              <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>No photos yet</Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginTop: 6, paddingHorizontal: 40, lineHeight: 20 }}>
                Photograph each area that needs repair. The AI will analyze each shot and build your estimate automatically.
              </Text>
            </View>
          ) : (
            photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onRetake={handleRetake} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
