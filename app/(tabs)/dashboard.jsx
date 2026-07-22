import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ProjectCard from "../../components/ProjectCard";
import { useCreateProject, useProjects } from "../../hooks/useProjects";

function StatsBar({ projects = [] }) {
  const total = projects.reduce((sum, p) => {
    const cost = (p.issues ?? []).reduce((s, i) => s + (i.estimated_cost ?? 0), 0);
    return sum + cost;
  }, 0);

  return (
    <View className="flex-row gap-3 px-5 pb-5">
      {[
        { label: "Projects", value: projects.length, icon: "🏠" },
        { label: "Total Estimates", value: `$${total.toLocaleString()}`, icon: "💰" },
        { label: "Active", value: projects.filter((p) => p.status !== "complete").length, icon: "🔄" },
      ].map(({ label, value, icon }) => (
        <View
          key={label}
          className="flex-1 rounded-2xl px-3 py-3 items-center"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}
        >
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          <Text className="text-white font-bold text-base mt-1">{value}</Text>
          <Text className="text-white/40 text-[10px] mt-0.5 text-center">{label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { data: projects = [], isLoading, isError, refetch } = useProjects();
  const createProject = useCreateProject();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      const { data } = await createProject.mutateAsync({
        name: name.trim(),
        address: address.trim() || null,
        status: "draft",
      });
      setModalVisible(false);
      setName("");
      setAddress("");
      if (data?.id) router.push(`/project/${data.id}`);
    } catch (e) {
      Alert.alert("Error", e.message ?? "Could not create project.");
    }
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Dark gradient header */}
      <LinearGradient colors={["#1A1F2E", "#252C3D"]} style={{ paddingTop: 56, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, overflow: "hidden" }}>
        <View className="px-5 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-white/50 text-sm">Good work,</Text>
            <Text className="text-white text-2xl font-bold">Your Projects</Text>
          </View>
          <View className="w-10 h-10 rounded-2xl bg-brand-amber items-center justify-center">
            <Text style={{ fontSize: 18 }}>🔍</Text>
          </View>
        </View>
        <StatsBar projects={projects} />
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 px-4 pt-5">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center gap-3">
            <Text className="text-4xl">⚠️</Text>
            <Text className="text-brand-muted text-base">Failed to load projects.</Text>
            <TouchableOpacity onPress={refetch} className="bg-brand-amber px-6 py-2.5 rounded-xl">
              <Text className="text-white font-semibold">Try again</Text>
            </TouchableOpacity>
          </View>
        ) : projects.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 pb-24">
            <View className="w-24 h-24 rounded-3xl bg-brand-amber/10 border border-brand-amber/20 items-center justify-center">
              <Text style={{ fontSize: 44 }}>🏗️</Text>
            </View>
            <Text className="text-xl font-bold text-brand-dark mt-2">No projects yet</Text>
            <Text className="text-sm text-brand-muted text-center px-10 leading-5">
              Add your first property to start capturing photos and generating AI repair estimates.
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
              className="mt-2"
            >
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>+ New Project</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProjectCard
                project={item}
                onPress={() => router.push(`/project/${item.id}`)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>

      {/* FAB */}
      {projects.length > 0 && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
          style={{
            position: "absolute", bottom: 28, right: 20,
            shadowColor: "#F59E0B", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={["#F59E0B", "#D97706"]}
            style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "300", lineHeight: 30 }}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* New Project Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View
            style={{ backgroundColor: "#1A1F2E", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
            className="px-6 pt-6 pb-12"
          >
            <View className="w-10 h-1 bg-white/20 rounded-full self-center mb-6" />
            <Text className="text-white text-xl font-bold mb-6">New Project</Text>

            <View className="gap-4">
              <View className="gap-1.5">
                <Text className="text-white/50 text-xs font-medium uppercase tracking-wider">Property Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. 123 Oak Ave — Kitchen"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white text-base"
                  autoFocus
                />
              </View>
              <View className="gap-1.5">
                <Text className="text-white/50 text-xs font-medium uppercase tracking-wider">Address (optional)</Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. Miami, FL 33101"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  className="bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white text-base"
                />
              </View>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={() => { setModalVisible(false); setName(""); setAddress(""); }}
                className="flex-1 rounded-2xl py-4 items-center"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}
              >
                <Text className="text-white/60 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={!name.trim() || createProject.isPending}
                activeOpacity={0.85}
                className="flex-1"
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
                >
                  {createProject.isPending
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={{ color: "#fff", fontWeight: "700" }}>Create →</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
