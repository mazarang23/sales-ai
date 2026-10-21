"use client";
import { useState } from "react";
import { PhotoUpload } from "./PhotoUpload";

export function ConsultantPhotoSection({ current }: { current: string | null }) {
  const [photo, setPhoto] = useState<string | null>(current);
  return (
    <PhotoUpload
      current={photo}
      onUploaded={url => setPhoto(url)}
    />
  );
}