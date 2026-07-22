import PropTypes from "prop-types";
import { Text, TouchableOpacity, View } from "react-native";

const STATUS = {
  complete: { label: "Complete",  dot: "#10B981", bg: "rgba(16,185,129,0.12)",  text: "#10B981" },
  analyzing:{ label: "Analyzing", dot: "#F59E0B", bg: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  draft:    { label: "Draft",     dot: "#64748B", bg: "rgba(100,116,139,0.12)", text: "#64748B" },
};

const CATEGORY_ICON = {
  Plumbing: "🔧", Electrical: "⚡", HVAC: "❄️", Structural: "🏗️",
  Roofing: "🏠", Flooring: "🪵", Painting: "🎨", Other: "📋",
};

/**
 * Card for a single project in the dashboard list.
 * @param {{ project: object, onPress: function }} props
 */
export default function ProjectCard({ project, onPress }) {
  const status = STATUS[project.status] ?? STATUS.draft;
  const issueCount = project.issues?.length ?? 0;
  const photoCount = project.photos?.length ?? 0;
  const totalCost = (project.issues ?? []).reduce(
    (sum, i) => sum + (i.estimated_cost ?? 0), 0
  );

  // Gather unique categories for mini-icon row
  const categories = [...new Set(
    (project.issues ?? []).map((i) => i.category ?? "Other")
  )].slice(0, 4);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-3xl overflow-hidden"
      style={{
        backgroundColor: "#fff",
        shadowColor: "#1A1F2E",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      {/* Top accent strip */}
      <View style={{ height: 4, backgroundColor: status.dot }} />

      <View className="px-5 py-4">
        {/* Row 1: name + status badge */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-brand-dark text-base font-bold" numberOfLines={1}>
              {project.name}
            </Text>
            {project.address ? (
              <Text className="text-brand-muted text-xs mt-0.5" numberOfLines={1}>
                📍 {project.address}
              </Text>
            ) : null}
          </View>

          {/* Status pill */}
          <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: status.bg }}>
            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }} />
            <Text style={{ color: status.text, fontSize: 11, fontWeight: "700" }}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Row 2: stats */}
        <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-brand-border">
          <View className="flex-row items-center gap-1">
            <Text className="text-brand-muted text-xs">📸</Text>
            <Text className="text-brand-muted text-xs">{photoCount}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-brand-muted text-xs">🔧</Text>
            <Text className="text-brand-muted text-xs">{issueCount} issue{issueCount !== 1 ? "s" : ""}</Text>
          </View>

          {/* Category icons */}
          {categories.length > 0 && (
            <View className="flex-row gap-1 flex-1 justify-end">
              {categories.map((cat) => (
                <Text key={cat} style={{ fontSize: 13 }}>{CATEGORY_ICON[cat] ?? "📋"}</Text>
              ))}
            </View>
          )}

          {/* Cost — right-aligned */}
          {totalCost > 0 && (
            <View className="ml-auto">
              <Text className="text-brand-dark text-sm font-bold">
                ${totalCost.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    status: PropTypes.string,
    issues: PropTypes.array,
    photos: PropTypes.array,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
};
