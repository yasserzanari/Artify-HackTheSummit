import ARClientLoader from "@/components/ar/ARClientLoader";
import AccessibilityOverlay from "@/components/accessibility/AccessibilityOverlay";

export default function ARPage() {
  return (
    <>
      <ARClientLoader />
      <AccessibilityOverlay />
    </>
  );
}
