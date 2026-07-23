import PropTypes from "prop-types";
import { Image, Text, TextInput, View } from "react-native";

const SEVERITY_COLOR = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

/**
 * Editable row for a single repair issue in the estimate report.
 *
 * @param {{ issue: object, onUpdate: function }} props
 */
export default function IssueRow({ issue, photo, onUpdate }) {
  const severityClass = SEVERITY_COLOR[issue.severity] ?? "bg-gray-100 text-gray-600";

  return (
    <View className="flex-row items-start py-3 border-b border-brand-border gap-3">
      {/* Photo thumbnail */}
      {photo?.public_url ? (
        <Image
          source={{ uri: photo.public_url }}
          style={{ width: 56, height: 56, borderRadius: 10 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 22 }}>📷</Text>
        </View>
      )}

      {/* Left: description + severity badge */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-brand-dark">{issue.description}</Text>
        <Text className="text-xs text-brand-muted mt-0.5">{issue.location}</Text>
        <View className={`self-start mt-1 px-2 py-0.5 rounded-full ${severityClass.split(" ")[0]}`}>
          <Text className={`text-[10px] font-semibold uppercase ${severityClass.split(" ")[1]}`}>
            {issue.severity}
          </Text>
        </View>
      </View>

      {/* Right: editable cost */}
      <View className="items-end">
        <View className="flex-row items-center border border-brand-border rounded-lg px-2 py-1">
          <Text className="text-sm text-brand-muted mr-0.5">$</Text>
          <TextInput
            value={String(issue.estimated_cost ?? "")}
            onChangeText={(val) =>
              onUpdate(issue.id, { estimated_cost: Number(val) || 0 })
            }
            keyboardType="numeric"
            className="text-sm font-semibold text-brand-dark w-16 text-right"
            returnKeyType="done"
          />
        </View>
        <Text className="text-[10px] text-brand-muted mt-0.5">est. cost</Text>
      </View>
    </View>
  );
}

IssueRow.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    location: PropTypes.string,
    severity: PropTypes.oneOf(["high", "medium", "low"]),
    estimated_cost: PropTypes.number,
    category: PropTypes.string,
    photo_id: PropTypes.string,
  }).isRequired,
  photo: PropTypes.shape({
    id: PropTypes.string,
    public_url: PropTypes.string,
  }),
  onUpdate: PropTypes.func.isRequired,
};
