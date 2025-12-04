"use client";

import styles from "./DeleteGathering.module.css";
import { getAccessToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function DeleteGatheringModal({ gatheringId, onClose }: any) {
  const router = useRouter();

  const handleDelete = async () => {
    const token = getAccessToken();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gatherings/${gatheringId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      router.push("/home");
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3>모임 삭제</h3>
        <p>정말 삭제하시겠습니까?</p>

        <div className={styles.btnRow}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button className={styles.deleteBtn} onClick={handleDelete}>삭제</button>
        </div>
      </div>
    </div>
  );
}
