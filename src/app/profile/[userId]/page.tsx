import ProfileClient from "./ProfileClient";

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  console.log("🔥 [page.tsx] UNWRAPPED userId:", userId);

  return <ProfileClient userId={userId} />;
}
