// Screen 03 — artwork detail: hero image, metadata, like/save, View in 3D
export default async function ArtworkDetailPage(props: PageProps<"/artwork/[id]">) {
  const { id } = await props.params;
  void id;
  return null;
}
