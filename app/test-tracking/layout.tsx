import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracking Test",
  robots: { index: false, follow: false },
};

export default function TestTrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
