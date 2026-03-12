import ProfileClient from "./ProfileClient";

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  return <ProfileClient userId={userId} />;
}
