"use client";
import { useState, useEffect } from "react";
import type { Comment } from "@prisma/client";


interface CommentsSectionProps {
  roomId?: string;
  reservationId?: string;
  comments: (Comment & { user: { name: string } })[];
}


export default function CommentsSection(props: CommentsSectionProps) {
  const { roomId, reservationId, comments } = props;
  const [commentList, setCommentList] = useState<typeof comments>(comments);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then(res => res.ok ? res.json() : null)
      .then(data => setSession(data))
      .catch(() => setSession(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        ...(reservationId ? { reservationId } : {}),
        ...(roomId && !reservationId ? { roomId } : {})
      }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setCommentList(prev => [newComment, ...prev]);
      setText("");
    }
    setLoading(false);
  }

  async function handleDeleteComment(commentId: string) {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (res.ok) {
      setCommentList(prev => prev.filter((c: any) => c.id !== commentId));
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input name="text" value={text} onChange={e => setText(e.target.value)} placeholder="Nova nota/comentário..." className="border p-2 rounded flex-1 text-black placeholder:text-gray-400" required />
        <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600" disabled={loading}>{loading ? "Adicionando..." : "Adicionar"}</button>
      </form>
      <ul className="space-y-2">
        {commentList.map((comment) => (
          <li key={comment.id} className="bg-white rounded p-2 text-sm flex flex-col">
            <span className="font-semibold text-black">{comment.user.name}</span>
            <span className="text-black">{comment.text}</span>
            <span className="text-xs text-black">{new Date(comment.createdAt).toLocaleString()}</span>
            {(session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") && (
              <button onClick={() => handleDeleteComment(comment.id)} className="text-red-600 hover:underline font-bold mt-1 self-end">Apagar</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
