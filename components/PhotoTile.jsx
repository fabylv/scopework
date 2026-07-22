import PropTypes from "prop-types";
import { ActivityIndicator, Image, Text, View } from "react-native";

const STATUS_CONFIG = {
  pending: { label: "Queued", color: "bg-yellow-100", text: "text-yellow-700" },
  analyzing: { label: "Analyzing…", color: "bg-blue-100", text: "text-blue-700" },
  done: { label: "Done", color: "bg-green-100", text: "text-green-700" },
  error: { label: "Error", color: "bg-red-100", text: "text-red-700" },
};

/**
 * Thumbnail tile for a single photo in the capture/review grid.
 *
 * @param {{ photo: object }} props
 */
export default function PhotoTile({ photo }) {
  const cfg = STATUS_CONFIG[photo.status] ?? STATUS_CONFIG.pending;
  const isAnalyzing = photo.status === "analyzing";

  return (
    <View className="w-[30%] aspect-square m-[1.5%] rounded-lg overflow-hidden bg-gray-100">
      <Image
        source={{ uri: photo.public_url }}
        className="w-full h-full"
        resizeMode="cover"
      />
      {/* Status badge overlay */}
      <View className="absolute bottom-0 left-0 right-0 px-1 py-0.5 flex-row items-center gap-1"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
        {isAnalyzing && (
          <ActivityIndicator size={10} color="#FFA12B" />
        )}
        <Text className="text-white text-[9px] font-medium flex-1" numberOfLines={1}>
          {cfg.label}
        </Text>
      </View>
    </View>
  );
}

PhotoTile.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    public_url: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["pending", "analyzing", "done", "error"]),
  }).isRequired,
};
