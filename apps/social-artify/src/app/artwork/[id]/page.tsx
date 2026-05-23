// Screen 03 — artwork detail: hero image, metadata, like/save, View in 3D
export default async function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  void id;
  return null;
}
