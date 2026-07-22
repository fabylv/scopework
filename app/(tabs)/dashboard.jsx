import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ProjectCard from "../../components/ProjectCard";
import { useCreateProject, useProjects } from "../../hooks/useProjects";

export default function DashboardScreen() {
  const router = useRouter();
  const { data: projects, isLoading, isError, refetch } = useProjects();
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
      {/* Header */}
      <View className="bg-brand-dark px-5 pt-14 pb-5">
        <Text className="text-2xl font-bold text-white">RepairIQ</Text>
        <Text className="text-sm text-gray-400 mt-0.5">
          Your repair estimates
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FFA12B" />
          </View>
        ) : isError ? (
          <View className="flex-1 items-center justify-center gap-3">
            <Text className="text-brand-muted text-base">
              Failed to load projects.
            </Text>
            <TouchableOpacity onPress={refetch}>
              <Text className="text-brand-amber font-semibold">Try again</Text>
            </TouchableOpacity>
          </View>
        ) : projects?.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2 pb-20">
            <Text className="text-4xl">🏗️</Text>
            <Text className="text-lg font-semibold text-brand-dark mt-2">
              No projects yet
            </Text>
            <Text className="text-sm text-brand-muted text-center px-8">
              Add your first property to start capturing repair photos and
              generating estimates.
            </Text>
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
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-8 right-5 bg-brand-amber rounded-full w-14 h-14 items-center justify-center shadow-lg"
        activeOpacity={0.85}
      >
        <Text className="text-white text-3xl font-light leading-none">+</Text>
      </TouchableOpacity>

      {/* New Project Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View className="bg-brand-bg rounded-t-2xl px-5 pt-5 pb-10 shadow-xl">
            <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-5" />
            <Text className="text-xl font-bold text-brand-dark mb-5">
              New Project
            </Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-brand-dark mb-1.5">
                  Property Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. 123 Main St — Master Bath"
                  className="bg-white border border-brand-border rounded-xl px-4 py-3 text-base text-brand-dark"
                  placeholderTextColor="#9CA3AF"
                  autoFocus
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-brand-dark mb-1.5">
                  Address (optional)
                </Text>
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g. 123 Main St, Miami FL"
                  className="bg-white border border-brand-border rounded-xl px-4 py-3 text-base text-brand-dark"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 border border-brand-border rounded-xl py-3.5 items-center"
                >
                  <Text className="text-brand-muted font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={!name.trim() || createProject.isPending}
                  className="flex-1 bg-brand-amber rounded-xl py-3.5 items-center"
                >
                  {createProject.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
