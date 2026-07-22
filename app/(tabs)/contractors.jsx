import { LinearGradient } from "expo-linear-gradient";
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

const TRADE_ICON = {
  Plumber: "🔧", Electrician: "⚡", HVAC: "❄️", Roofer: "🏠",
  Painter: "🎨", General: "🏗️", Flooring: "🪵", Other: "👷",
};

function ContractorCard({ contractor, onDelete }) {
  const icon = TRADE_ICON[contractor.trade] ?? "👷";
  return (
    <View
      className="bg-white rounded-2xl px-5 py-4 mb-3 flex-row items-center"
      style={{ shadowColor: "#1A1F2E", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: "rgba(245,158,11,0.1)" }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-dark font-bold text-base">{contractor.name}</Text>
        <Text className="text-brand-muted text-sm">{contractor.trade}</Text>
        {contractor.phone ? (
          <Text className="text-brand-muted text-xs mt-0.5">📞 {contractor.phone}</Text>
        ) : null}
      </View>
      <TouchableOpacity
        onPress={() =>
          Alert.alert("Remove Contractor", `Remove ${contractor.name}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: () => onDelete(contractor.id) },
          ])
        }
        className="w-8 h-8 items-center justify-center"
      >
        <Text style={{ color: "#EF4444", fontSize: 17 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const TRADES = ["General", "Plumber", "Electrician", "HVAC", "Roofer", "Painter", "Flooring", "Other"];

export default function ContractorsScreen() {
  const { data: contractors = [], isLoading } = useContractors();
  const createContractor = useCreateContractor();
  const deleteContractor = useDeleteContractor();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("General");
  const [phone, setPhone] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createContractor.mutateAsync({ name: name.trim(), trade, phone: phone.trim() || null });
      setModalVisible(false);
      setName(""); setTrade("General"); setPhone("");
    } catch (e) {
      Alert.alert("Error", e.message ?? "Could not save.");
    }
  }

  return (
    <View className="flex-1 bg-brand-bg">
      <LinearGradient colors={["#1A1F2E", "#252C3D"]}
        style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <Text className="text-white text-2xl font-bold">Contractors</Text>
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 3 }}>
          {contractors.length} saved contact{contractors.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      <View className="flex-1 px-4 pt-5">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : contractors.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 pb-24">
            <View className="w-24 h-24 rounded-3xl bg-brand-amber/10 border border-brand-amber/20 items-center justify-center">
              <Text style={{ fontSize: 44 }}>👷</Text>
            </View>
            <Text className="text-xl font-bold text-brand-dark">No contractors yet</Text>
            <Text className="text-sm text-brand-muted text-center px-10 leading-5">
              Save your trusted contractors to quickly assign them to repair line items.
            </Text>
          </View>
        ) : (
          <FlatList
            data={contractors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ContractorCard contractor={item} onDelete={(id) => deleteContractor.mutate(id)} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
        style={{
          position: "absolute", bottom: 28, right: 20,
          shadowColor: "#F59E0B", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8,
        }}
      >
        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "300", lineHeight: 30 }}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ backgroundColor: "#1A1F2E", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}>
            <View style={{ width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, alignSelf: "center", marginBottom: 24 }} />
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>Add Contractor</Text>

            <View style={{ gap: 16 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Name *</Text>
                <TextInput
                  value={name} onChangeText={setName}
                  placeholder="e.g. John Smith"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 16 }}
                  autoFocus
                />
              </View>

              {/* Trade picker */}
              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Trade</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {TRADES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTrade(t)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
                        backgroundColor: trade === t ? "#F59E0B" : "rgba(255,255,255,0.08)",
                        borderWidth: 1, borderColor: trade === t ? "#F59E0B" : "rgba(255,255,255,0.15)",
                      }}
                    >
                      <Text style={{ color: trade === t ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "600" }}>
                        {TRADE_ICON[t] ?? "👷"} {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Phone</Text>
                <TextInput
                  value={phone} onChangeText={setPhone}
                  placeholder="555-000-1234" keyboardType="phone-pad"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontSize: 16 }}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                onPress={() => { setModalVisible(false); setName(""); setTrade("General"); setPhone(""); }}
                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
              >
                <Text style={{ color: "rgba(255,255,255,0.6)", fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreate} disabled={!name.trim() || createContractor.isPending} activeOpacity={0.85} style={{ flex: 1 }}>
                <LinearGradient colors={["#F59E0B", "#D97706"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}>
                  {createContractor.isPending ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "700" }}>Save →</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
