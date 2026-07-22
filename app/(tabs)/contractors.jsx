import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SectionList,
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
import { shadows } from "../../lib/shadow";

const TRADE_ICON = {
  Plumber: "🔧", Electrician: "⚡", HVAC: "❄️", Roofer: "🏠",
  Painter: "🎨", General: "🏗️", Flooring: "🪵", Supplies: "🏪",
  Inspector: "🔍", Landscaping: "🌿", Other: "👷",
};

const CATEGORY_META = {
  Trades:    { icon: "🔧", color: "#3B82F6" },
  Suppliers: { icon: "🏪", color: "#10B981" },
  Specialty: { icon: "🔍", color: "#8B5CF6" },
  Other:     { icon: "👷", color: "#64748B" },
};

const TRADES = ["General", "Plumber", "Electrician", "HVAC", "Roofer", "Painter", "Flooring", "Inspector", "Landscaping", "Supplies", "Other"];
const CATEGORIES = ["Suppliers", "Specialty", "Other"];

// Human-readable plural display names for each trade
const TRADE_DISPLAY = {
  General: "General Contractors",
  Plumber: "Plumbers",
  Electrician: "Electricians",
  HVAC: "HVAC",
  Roofer: "Roofers",
  Painter: "Painters",
  Flooring: "Flooring",
  Inspector: "Inspectors",
  Landscaping: "Landscaping",
  Supplies: "Supplies",
  Other: "Other",
};

/**
 * Group contractors into SectionList sections:
 * - Trades → one section per trade type (Plumbers, Roofers, etc.)
 * - Suppliers / Specialty / Other → one section per category
 */
function groupContractors(contractors = []) {
  const tradeMap = {};
  const categoryMap = {};

  for (const c of contractors) {
    if (c.category === "Trades") {
      const trade = c.trade ?? "Other";
      if (!tradeMap[trade]) tradeMap[trade] = [];
      tradeMap[trade].push(c);
    } else {
      const cat = c.category ?? "Other";
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(c);
    }
  }

  const sections = [];

  // Trade sections in a sensible order
  for (const trade of TRADES) {
    if (tradeMap[trade]?.length) {
      sections.push({ title: trade, display: TRADE_DISPLAY[trade] ?? trade, data: tradeMap[trade], kind: "trade" });
    }
  }
  // Any trade types not in the preset order
  for (const trade of Object.keys(tradeMap)) {
    if (!TRADES.includes(trade) && tradeMap[trade]?.length) {
      sections.push({ title: trade, display: trade, data: tradeMap[trade], kind: "trade" });
    }
  }

  // Non-trade category sections
  for (const cat of CATEGORIES) {
    if (categoryMap[cat]?.length) {
      sections.push({ title: cat, display: cat, data: categoryMap[cat], kind: "category" });
    }
  }
  for (const cat of Object.keys(categoryMap)) {
    if (!CATEGORIES.includes(cat) && categoryMap[cat]?.length) {
      sections.push({ title: cat, display: cat, data: categoryMap[cat], kind: "category" });
    }
  }

  return sections;
}

function ContractorCard({ contractor, onDelete }) {
  const icon = TRADE_ICON[contractor.trade] ?? "👷";
  return (
    <View
      className="bg-white rounded-2xl px-5 py-4 mb-2.5 flex-row items-center"
      style={shadows.dark}
    >
      <View
        className="w-11 h-11 rounded-xl items-center justify-center mr-4"
        style={{ backgroundColor: "rgba(245,158,11,0.1)" }}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
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
          Alert.alert("Remove", `Remove ${contractor.name}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: () => onDelete(contractor.id) },
          ])
        }
        className="w-8 h-8 items-center justify-center"
      >
        <Text style={{ color: "#EF4444", fontSize: 16 }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function SectionHeader({ title, display, kind }) {
  if (kind === "trade") {
    const icon = TRADE_ICON[title] ?? "👷";
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 16, paddingBottom: 8, backgroundColor: "#F8F7F4" }}>
        <Text style={{ fontSize: 14 }}>{icon}</Text>
        <Text style={{ fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2, color: "#64748B" }}>
          {display}
        </Text>
      </View>
    );
  }
  const meta = CATEGORY_META[title] ?? CATEGORY_META.Other;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 20, paddingBottom: 8, backgroundColor: "#F8F7F4", borderTopWidth: 1, borderTopColor: "#E2E8F0", marginTop: 4 }}>
      <View style={{ width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: meta.color + "22" }}>
        <Text style={{ fontSize: 12 }}>{meta.icon}</Text>
      </View>
      <Text style={{ fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.2, color: meta.color }}>
        {display}
      </Text>
    </View>
  );
}

export default function ContractorsScreen() {
  const { data: contractors = [], isLoading } = useContractors();
  const createContractor = useCreateContractor();
  const deleteContractor = useDeleteContractor();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [trade, setTrade] = useState("General");
  const [category, setCategory] = useState("Trades");
  const [phone, setPhone] = useState("");

  const sections = groupContractors(contractors);
  const totalCount = contractors.length;

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createContractor.mutateAsync({
        name: name.trim(),
        trade,
        category,
        phone: phone.trim() || null,
      });
      setModalVisible(false);
      setName(""); setTrade("General"); setCategory("Trades"); setPhone("");
    } catch (e) {
      Alert.alert("Error", e.message ?? "Could not save.");
    }
  }

  function resetModal() {
    setModalVisible(false);
    setName(""); setTrade("General"); setCategory("Trades"); setPhone("");
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <LinearGradient colors={["#1A1F2E", "#252C3D"]}
        style={{ paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <Text className="text-white text-2xl font-bold">Contractors</Text>
        <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 3 }}>
          {totalCount} contact{totalCount !== 1 ? "s" : ""} · {sections.length} group{sections.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      {/* List */}
      <View className="flex-1 px-4">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : sections.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-3 pb-24">
            <View className="w-24 h-24 rounded-3xl bg-brand-amber/10 border border-brand-amber/20 items-center justify-center">
              <Text style={{ fontSize: 44 }}>👷</Text>
            </View>
            <Text className="text-xl font-bold text-brand-dark">No contractors yet</Text>
            <Text className="text-sm text-brand-muted text-center px-10 leading-5">
              Add contractors and suppliers to quickly assign them to repair line items.
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => <SectionHeader title={section.title} display={section.display} kind={section.kind} />}
            renderItem={({ item }) => (
              <ContractorCard contractor={item} onDelete={(id) => deleteContractor.mutate(id)} />
            )}
            stickySectionHeadersEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        )}
      </View>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
        style={{ position: "absolute", bottom: 28, right: 20, ...shadows.amber }}
      >
        <LinearGradient
          colors={["#F59E0B", "#D97706"]}
          style={{ width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#fff", fontSize: 26, fontWeight: "300", lineHeight: 30 }}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={resetModal}>
        <KeyboardAvoidingView className="flex-1 justify-end" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={{ backgroundColor: "#1A1F2E", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 }}>
            <View style={{ width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, alignSelf: "center", marginBottom: 24 }} />
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 20 }}>Add Contractor</Text>

            <View style={{ gap: 16 }}>
              {/* Name */}
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

              {/* Category picker */}
              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Category</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const active = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat} onPress={() => setCategory(cat)}
                        style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: active ? meta.color : "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: active ? meta.color : "rgba(255,255,255,0.15)" }}
                      >
                        <Text style={{ fontSize: 16 }}>{meta.icon}</Text>
                        <Text style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", marginTop: 3 }}>{cat}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Trade picker */}
              <View style={{ gap: 6 }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>Trade / Type</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {TRADES.map((t) => (
                    <TouchableOpacity
                      key={t} onPress={() => setTrade(t)}
                      style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: trade === t ? "#F59E0B" : "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: trade === t ? "#F59E0B" : "rgba(255,255,255,0.15)" }}
                    >
                      <Text style={{ color: trade === t ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600" }}>
                        {TRADE_ICON[t] ?? "👷"} {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Phone */}
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
              <TouchableOpacity onPress={resetModal}
                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}>
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
