import PropTypes from "prop-types";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * Card displayed in the dashboard project list.
 *
 * @param {{ project: object, onPress: function }} props
 */
export default function ProjectCard({ project, onPress }) {
  const issueCount = project.issues?.length ?? 0;
  const photoCount = project.photos?.length ?? 0;

  const statusColor =
    project.status === "complete"
      ? "text-brand-success"
      : project.status === "analyzing"
        ? "text-yellow-500"
        : "text-brand-muted";

  const statusLabel =
    project.status === "complete"
      ? "Complete"
      : project.status === "analyzing"
        ? "Analyzing…"
        : "Draft";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className="bg-white rounded-xl shadow-sm border border-brand-border px-4 py-4 mb-3"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-brand-dark" numberOfLines={1}>
            {project.name}
          </Text>
          {project.address ? (
            <Text className="text-sm text-brand-muted mt-0.5" numberOfLines={1}>
              {project.address}
            </Text>
          ) : null}
        </View>
        <Text className={`text-xs font-medium ${statusColor}`}>{statusLabel}</Text>
      </View>

      <View className="flex-row mt-3 gap-4">
        <Text className="text-xs text-brand-muted">
          📸 {photoCount} photo{photoCount !== 1 ? "s" : ""}
        </Text>
        <Text className="text-xs text-brand-muted">
          🔧 {issueCount} issue{issueCount !== 1 ? "s" : ""}
        </Text>
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
