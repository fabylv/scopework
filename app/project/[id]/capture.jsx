import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { shadows } from "../../../lib/shadow";

// ─── Mock AI results (cycles on each photo) ──────────────────────────────────
const MOCK_RESULTS = [
  { quality: "good", issues: [
      { description: "Roof shingles cracked and lifting",        category: "Roofing",   severity: "high",   estimated_cost: 3500 },
      { description: "Water stain on ceiling below roof",        category: "Structural", severity: "medium", estimated_cost: 800  },
  ]},
  { quality: "poor",  guidance: "Photo too dark — turn on a light or move closer." },
  { quality: "good", issues: [
      { description: "Mold visible behind bathroom tiles",       category: "Plumbing",  severity: "high",   estimated_cost: 2200 },
  ]},
  { quality: "poor",  guidance: "Too far away — get closer to the damaged area." },
  { quality: "good", issues: [
      { description: "HVAC filter clogged, needs service",       category: "HVAC",      severity: "medium", estimated_cost: 450  },
      { description: "Duct tape patch on vent — needs repair",   category: "HVAC",      severity: "low",    estimated_cost: 120  },
  ]},
  { quality: "good", issues: [
      { description: "Cracked floor tiles near sink",            category: "Flooring",  severity: "low",    estimated_cost: 300  },
  ]},
];

let mockCycle = 0;
const nextMock = () => MOCK_RESULTS[mockCycle++ % MOCK_RESULTS.length];

// ─── Constants ────────────────────────────────────────────────────────────────
const SEV_COLOR = { high: "#EF4444", medium: "#F59E0B", low: "#10B981" };
const SEV_BG    = { high: "rgba(239,68,68,0.12)", medium: "rgba(245,158,11,0.12)", low: "rgba(16,185,129,0.12)" };
const CAT_ICON  = { Roofing:"🏠", Plumbing:"🔧", Electrical:"⚡", HVAC:"❄️", Structural:"🏗️", Flooring:"🪵", Painting:"🎨", Other:"📋" };

// ─── Sub-components ───────────────────────────────────────────────────────────
function PhotoCard({ photo, onRetake }) {
  const { status, uri, result } = photo;
  const analyzing = status === "analyzing";
  const isPoor    = result?.quality === "poor";
  const isGood    = result?.quality === "good";
  const issues    = result?.issues ?? [];

  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-3" style={shadows.dark}>
      <View style={{ position: "relative" }}>
        <Image source={{ uri }} style={{ width: "100%", height: 180 }} resizeMode="cover" />

        {analyzing && (
          <View style={{ position:"absolute", inset:0, backgroundColor:"rgba(26,31,46,0.7)", alignItems:"center", justifyContent:"center", gap:8 }}>
            <Text style={{ fontSize:32 }}>🔍</Text>
            <Text style={{ color:"#F59E0B", fontWeight:"700", fontSize:14 }}>Analyzing photo…</Text>
            <Text style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>AI is detecting repair issues</Text>
          </View>
        )}

        {isPoor && (
          <View style={{ position:"absolute", bottom:0, left:0, right:0, backgroundColor:"rgba(239,68,68,0.92)", padding:10, flexDirection:"row", alignItems:"center", gap:8 }}>
            <Text style={{ fontSize:16 }}>⚠️</Text>
            <Text style={{ color:"#fff", fontSize:12, fontWeight:"600", flex:1 }}>{result.guidance}</Text>
          </View>
        )}

        {isGood && issues.length > 0 && (
          <View style={{ position:"absolute", top:10, right:10, backgroundColor:"rgba(16,185,129,0.9)", borderRadius:10, paddingHorizontal:10, paddingVertical:4 }}>
            <Text style={{ color:"#fff", fontSize:11, fontWeight:"700" }}>✓ {issues.length} issue{issues.length !== 1 ? "s" : ""} found</Text>
          </View>
        )}
      </View>

      {isGood && issues.length > 0 && (
        <View style={{ padding:12, gap:8 }}>
          {issues.map((issue, i) => (
            <View key={i} style={{ flexDirection:"row", alignItems:"flex-start", gap:10 }}>
              <View style={{ width:28, height:28, borderRadius:8, backgroundColor:SEV_BG[issue.severity], alignItems:"center", justifyContent:"center" }}>
                <Text style={{ fontSize:13 }}>{CAT_ICON[issue.category] ?? "📋"}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:13, fontWeight:"600", color:"#1A1F2E" }}>{issue.description}</Text>
                <View style={{ flexDirection:"row", alignItems:"center", gap:6, marginTop:3 }}>
                  <View style={{ paddingHorizontal:7, paddingVertical:2, borderRadius:6, backgroundColor:SEV_BG[issue.severity] }}>
                    <Text style={{ fontSize:10, fontWeight:"700", color:SEV_COLOR[issue.severity], textTransform:"uppercase" }}>{issue.severity}</Text>
                  </View>
                  <Text style={{ fontSize:12, color:"#64748B" }}>${issue.estimated_cost?.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {isGood && issues.length === 0 && (
        <View style={{ padding:12, flexDirection:"row", alignItems:"center", gap:8 }}>
          <Text>✅</Text>
          <Text style={{ fontSize:13, color:"#64748B" }}>No visible repairs detected.</Text>
        </View>
      )}

      {isPoor && (
        <TouchableOpacity onPress={() => onRetake(photo.id)}
          style={{ margin:12, marginTop:4, backgroundColor:"#EF4444", borderRadius:12, paddingVertical:10, alignItems:"center" }}>
          <Text style={{ color:"#fff", fontWeight:"700", fontSize:13 }}>📷 Retake Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EstimateBar({ issues }) {
  if (!issues.length) return null;
  const total = issues.reduce((s, i) => s + (i.estimated_cost ?? 0), 0);
  return (
    <LinearGradient colors={["#1A1F2E","#252C3D"]} style={{ borderRadius:20, padding:16, flexDirection:"row", alignItems:"center", marginHorizontal:16, marginBottom:12 }}>
      <View style={{ flex:1 }}>
        <Text style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:"700", textTransform:"uppercase", letterSpacing:1 }}>Running Estimate</Text>
        <Text style={{ color:"#F59E0B", fontSize:28, fontWeight:"800", marginTop:2 }}>${total.toLocaleString()}</Text>
        <Text style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2 }}>{issues.length} issue{issues.length !== 1 ? "s" : ""} detected</Text>
      </View>
      <View style={{ gap:5 }}>
        {["high","medium","low"].map((s) => {
          const n = issues.filter((i) => i.severity === s).length;
          if (!n) return null;
          return (
            <View key={s} style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
              <View style={{ width:8, height:8, borderRadius:4, backgroundColor:SEV_COLOR[s] }} />
              <Text style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>{n} {s}</Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function CaptureScreen() {
  const { id: projectId } = useLocalSearchParams();
  const router = useRouter();

  const [photos, setPhotos]   = useState([]);
  const [allIssues, setAllIssues] = useState([]);

  async function pickAndProcess(launchFn) {
    try {
      const result = await launchFn();
      if (result.canceled || !result.assets?.length) return;
      for (const asset of result.assets) {
        await processAsset(asset);
      }
    } catch (e) {
      Alert.alert("Error", e?.message ?? "Could not load photo.");
    }
  }

  async function handleCamera() {
    if (Platform.OS === "web") {
      // input.click() must happen synchronously (before any await) to keep
      // the user-gesture context on mobile Chrome
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment"; // opens rear camera directly on Android
      input.style.cssText = "position:fixed;top:-999px;left:-999px;opacity:0;";
      document.body.appendChild(input);

      const filePromise = new Promise((resolve) => {
        input.onchange = (e) => {
          document.body.removeChild(input);
          resolve(e.target.files?.[0] ?? null);
        };
      });

      input.click(); // synchronous — still in gesture context

      try {
        const file = await filePromise;
        if (file) {
          const uri = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          await processAsset({ uri, fileName: file.name, mimeType: file.type });
        }
      } catch (e) {
        Alert.alert("Error", e?.message ?? "Could not open camera.");
      }
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Access", "RepairIQ needs camera access to capture photos.");
      return;
    }
    await pickAndProcess(() =>
      ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 })
    );
  }

  async function handleGallery() {
    await pickAndProcess(() =>
      ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 })
    );
  }

  async function processAsset(asset) {
    const id = `photo-${Date.now()}`;
    setPhotos((p) => [{ id, uri: asset.uri, status: "analyzing", result: null }, ...p]);

    // Simulate AI analysis (2s delay)
    // TODO: replace with real Supabase upload + Edge Function call
    await new Promise((r) => setTimeout(r, 2000));
    const result = nextMock();

    setPhotos((p) => p.map((x) => x.id === id ? { ...x, status: "done", result } : x));

    if (result.quality === "good" && result.issues?.length) {
      setAllIssues((prev) => [...prev, ...result.issues.map((i) => ({ ...i, photoId: id }))]);
    }
  }

  function handleRetake(photoId) {
    setPhotos((p) => p.filter((x) => x.id !== photoId));
    handleCamera();
  }

  const analyzing = photos.filter((p) => p.status === "analyzing").length;

  return (
    <View style={{ flex:1, backgroundColor:"#12161F" }}>
      {/* Header */}
      <LinearGradient colors={["#1A1F2E","#12161F"]} style={{ paddingTop:56, paddingHorizontal:20, paddingBottom:20 }}>
        <TouchableOpacity onPress={() => router.replace(`/project/${projectId}`)} style={{ marginBottom:12 }}>
          <Text style={{ color:"#F59E0B", fontSize:14, fontWeight:"600" }}>← Back to Report</Text>
        </TouchableOpacity>
        <Text style={{ color:"#fff", fontSize:22, fontWeight:"800" }}>Capture Photos</Text>
        <Text style={{ color: analyzing > 0 ? "#F59E0B" : "rgba(255,255,255,0.4)", fontSize:13, marginTop:3 }}>
          {analyzing > 0
            ? `🔍 Analyzing ${analyzing} photo${analyzing !== 1 ? "s" : ""}…`
            : photos.length === 0
              ? "Walk the property and photograph each issue"
              : `${photos.length} photo${photos.length !== 1 ? "s" : ""} · ${allIssues.length} issue${allIssues.length !== 1 ? "s" : ""} found`}
        </Text>
      </LinearGradient>

      {/* Buttons */}
      <View style={{ flexDirection:"row", gap:12, paddingHorizontal:16, paddingTop:16, paddingBottom:12 }}>
        <TouchableOpacity onPress={handleCamera} activeOpacity={0.85} style={{ flex:1 }}>
          <LinearGradient colors={["#F59E0B","#D97706"]} start={{x:0,y:0}} end={{x:1,y:0}}
            style={{ borderRadius:18, paddingVertical:16, alignItems:"center", flexDirection:"row", justifyContent:"center", gap:8 }}>
            <Text style={{ fontSize:18 }}>📷</Text>
            <Text style={{ color:"#fff", fontWeight:"700", fontSize:14 }}>Camera</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleGallery} activeOpacity={0.85}
          style={{ flex:1, backgroundColor:"rgba(255,255,255,0.08)", borderRadius:18, paddingVertical:16, alignItems:"center", flexDirection:"row", justifyContent:"center", gap:8, borderWidth:1, borderColor:"rgba(255,255,255,0.15)" }}>
          <Text style={{ fontSize:18 }}>🖼️</Text>
          <Text style={{ color:"#fff", fontWeight:"700", fontSize:14 }}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Tip */}
      <View style={{ marginHorizontal:16, marginBottom:12, backgroundColor:"rgba(245,158,11,0.1)", borderRadius:14, padding:12, borderWidth:1, borderColor:"rgba(245,158,11,0.2)" }}>
        <Text style={{ color:"#F59E0B", fontSize:12, fontWeight:"600", lineHeight:18 }}>
          💡 Get close to each repair area. The AI will tell you if a photo needs to be retaken.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:60 }}>
        <EstimateBar issues={allIssues} />

        <View style={{ paddingHorizontal:16 }}>
          {photos.length === 0 ? (
            <View style={{ alignItems:"center", paddingTop:40, paddingBottom:60 }}>
              <View style={{ width:96, height:96, borderRadius:28, backgroundColor:"rgba(255,255,255,0.06)", borderWidth:1, borderColor:"rgba(255,255,255,0.1)", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <Text style={{ fontSize:44 }}>📸</Text>
              </View>
              <Text style={{ color:"#fff", fontSize:17, fontWeight:"700" }}>No photos yet</Text>
              <Text style={{ color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", marginTop:6, paddingHorizontal:40, lineHeight:20 }}>
                Photograph each repair area. The AI analyzes each shot and builds your estimate automatically.
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
