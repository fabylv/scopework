import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import IssueRow from "../../../components/IssueRow";
import { useProject } from "../../../hooks/useProjects";
import { updateIssue } from "../../../lib/api/issues";

function groupIssuesByCategory(issues = []) {
  const map = {};
  for (const issue of issues) {
    const cat = issue.category ?? "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(issue);
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

function totalCost(issues = []) {
  return issues.reduce((sum, i) => sum + (i.estimated_cost ?? 0), 0);
}

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: project, isLoading, refetch } = useProject(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-bg items-center justify-center">
        <ActivityIndicator size="large" color="#FFA12B" />
      </View>
    );
  }

  if (!project) {
    return (
      <View className="flex-1 bg-brand-bg items-center justify-center px-6">
        <Text className="text-brand-muted text-base">Project not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-brand-amber font-semibold">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = groupIssuesByCategory(project.issues);
  const total = totalCost(project.issues);

  async function handleUpdateIssue(issueId, updates) {
    await updateIssue(issueId, updates);
    refetch();
  }

  return (
    <View className="flex-1 bg-brand-bg">
      {/* Header */}
      <View className="bg-brand-dark px-5 pt-14 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-brand-amber text-sm font-medium">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white" numberOfLines={1}>
          {project.name}
        </Text>
        {project.address ? (
          <Text className="text-sm text-gray-400 mt-0.5">{project.address}</Text>
        ) : null}
      </View>

      {/* Total cost banner */}
      <View className="mx-4 mt-4 bg-white rounded-xl border border-brand-border px-4 py-3 flex-row items-center justify-between">
        <Text className="text-sm text-brand-muted font-medium">
          Total Estimated Cost
        </Text>
        <Text className="text-xl font-bold text-brand-dark">
          ${total.toLocaleString()}
        </Text>
      </View>

      {/* Capture photos button */}
      <TouchableOpacity
        onPress={() => router.push(`/project/${id}/capture`)}
        className="mx-4 mt-3 bg-brand-amber rounded-xl py-3 items-center"
      >
        <Text className="text-white font-semibold text-base">
          📸 Add / Capture Photos
        </Text>
      </TouchableOpacity>

      {/* Issues list */}
      {sections.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-2 pb-20">
          <Text className="text-4xl mt-6">📋</Text>
          <Text className="text-base font-semibold text-brand-dark mt-2">
            No issues detected yet
          </Text>
          <Text className="text-sm text-brand-muted text-center px-8">
            Capture photos of repair areas and the AI will identify issues and
            estimate costs.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 }}
          renderSectionHeader={({ section: { title } }) => (
            <View className="bg-brand-bg pt-4 pb-1">
              <Text className="text-xs font-bold uppercase tracking-widest text-brand-muted">
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <IssueRow issue={item} onUpdate={handleUpdateIssue} />
          )}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
