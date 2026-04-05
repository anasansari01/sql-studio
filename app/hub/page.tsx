import { Metadata } from "next";
import { HubClient } from "@/components/hub/hubClient";


export const metadata: Metadata = {
  title: "SQL Studio — Learn SQL by Doing",
  description:
    "A browser-based SQL learning platform with real-time query execution and AI-powered hints.",
  keywords: ["SQL", "learning", "database", "queries", "tutorial"],
};

export default function HubPage() {
  return <HubClient />;
}