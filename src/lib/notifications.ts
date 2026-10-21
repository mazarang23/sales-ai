import { db } from "@/lib/db";

type NotifyTarget =
  | { userId: string; consultantId?: undefined }
  | { consultantId: string; userId?: undefined };

export async function notify(
  target: NotifyTarget,
  data: { type: string; title: string; body: string; link?: string }
) {
  try {
    await db.notification.create({
      data: {
        userId: target.userId || null,
        consultantId: target.consultantId || null,
        type: data.type,
        title: data.title,
        body: data.body,
        link: data.link || null
      }
    });
  } catch (e) {
    console.error("notify error:", e);
  }
}

export async function notifyAdmins(data: {
  type: string;
  title: string;
  body: string;
  link?: string;
}) {
  try {
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true }
    });
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: data.type,
          title: data.title,
          body: data.body,
          link: data.link || null
        }
      });
    }
  } catch (e) {
    console.error("notifyAdmins error:", e);
  }
}