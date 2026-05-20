import PublicProfileView from "@/views/PublicProfileView";

export const metadata = {
  title: "Host Profile | CarRental",
  description: "View host details, ratings, and their fleet of luxury vehicles.",
};

export default function ProfilePage() {
  return <PublicProfileView />;
}
