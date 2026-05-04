"use client";

import { useEffect } from "react";
import { trackPixelEvent, type PixelEventData } from "@/lib/tracking";

interface TrackPixelViewProps {
  contentName: string;
  contentCategory?: string;
}

// Fires a Meta Pixel "ViewContent" event once on mount.
// Drop into any page that represents a discrete product/program view
// (term programs, holiday camp, etc). Page-load PageView is already
// handled globally by the base Pixel.
export default function TrackPixelView({
  contentName,
  contentCategory,
}: TrackPixelViewProps) {
  useEffect(() => {
    const data: PixelEventData = { content_name: contentName };
    if (contentCategory) data.content_category = contentCategory;
    trackPixelEvent("ViewContent", data);
  }, [contentName, contentCategory]);

  return null;
}
