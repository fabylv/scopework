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

import {
  useContractors,
  useCreateContractor,
  useDeleteContractor,
} from "../../hooks/useContractors";

function ContractorRow({ contractor, onDelete }) {
  return (
    <View className="bg-white rounded-xl border border-brand-border px-4 py-3 mb-3 flex-row items-center">
      <View className="flex-1">
        <Text className="text-base font-semibold text-brand-dark">
          {contractor.name}
        </Text>
        <Text className="text-sm text-brand-muted">{contractor.trade}</Text>
        {contractor.phone ? (
          <Text className="text-xs text-brand-muted mt-0.5">
            📞 {contractor.phone}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            "Delete Contractor",
            `Remove ${contractor.name}?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => onDelete(contractor.id),
              },
            ]
          )
        }
        className="p-2"
      >
        <Text className="text-brand-danger text-lg">🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ContractorsScreen() {
  const { data: contractors, isLoading } = useContractors();
  const createContractor = useCreateContractor();
  const deleteContractor = useDeleteContractor();

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: "", trade: "", phone: "" });

  async function handleCreate() {
    if (!form.name.trim() || !form.trade.trim()) return;
    try {
      await createContractor.mutateAsync({
        name: form.name.trim(),
        trade: form.trade.trim(),
        phone: form.phone.trim() || null,
      });
      setModalVisible(false);
      setForm({ name: "", trade: "", phone: "" });
    } catch (e) {
      Alert.alert("Error", e.message ?? "Could not save contractor.");
    }
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <View className="bg-brand-dark px-5 pt-14 pb-5">
        <Text className="text-2xl font-bold text-white">Contractors</Text>
        <Text className="text-sm text-gray-400 mt-0.5">Your saved contacts</Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FFA12B" />
          </View>
        ) : contractors?.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-2 pb-20">
            <Text className="text-4xl">🔧</Text>
            <Text className="text-lg font-semibold text-brand-dark mt-2">
              No contractors yet
            </Text>
            <Text className="text-sm text-brand-muted text-center px-8">
              Add contractors to quickly assign them to repair line items.
            </Text>
          </View>
        ) : (
          <FlatList
            data={contractors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContractorRow
                contractor={item}
                onDelete={(id) => deleteContractor.mutate(id)}
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

      {/* Add Contractor Modal */}
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
              Add Contractor
            </Text>

            <View className="gap-4">
              {[
                { label: "Name *", key: "name", placeholder: "John Smith" },
                {
                  label: "Trade *",
                  key: "trade",
                  placeholder: "e.g. Plumber, Electrician, General",
                },
                { label: "Phone", key: "phone", placeholder: "555-000-1234", keyboard: "phone-pad" },
              ].map(({ label, key, placeholder, keyboard }) => (
                <View key={key}>
                  <Text className="text-sm font-medium text-brand-dark mb-1.5">
                    {label}
                  </Text>
                  <TextInput
                    value={form[key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    placeholder={placeholder}
                    keyboardType={keyboard ?? "default"}
                    className="bg-white border border-brand-border rounded-xl px-4 py-3 text-base text-brand-dark"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              ))}

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 border border-brand-border rounded-xl py-3.5 items-center"
                >
                  <Text className="text-brand-muted font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreate}
                  disabled={createContractor.isPending}
                  className="flex-1 bg-brand-amber rounded-xl py-3.5 items-center"
                >
                  {createContractor.isPending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">Save</Text>
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
