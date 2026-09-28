import { Dashboard } from "@/features/dashboard/dashboard";
import { readAppConfig } from "@/lib/config";

export default function HomePage() {
  readAppConfig({ STARRBOARD_MODE: process.env.STARRBOARD_MODE });
  return <Dashboard page="home" />;
}
