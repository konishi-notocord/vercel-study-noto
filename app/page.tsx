// ▼ Vercelのビルドエラー対策
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server"; // ※path注意
import { revalidatePath } from "next/cache";

export default async function Home() {
  const supabase = await createClient();
  
  // ▼ データを取得（いいね順に並べる）
  const { data: posts } = await supabase.from("posts").select().order('likes', { ascending: false });

  // --------------------------------------------------------
  // ▼ 機能1：新規投稿を追加する処理（ここが復活しました！）
  // --------------------------------------------------------
  const addPost = async (formData: FormData) => {
    "use server";
    const title = formData.get("title") as string;
    if (!title) return; // 空文字なら何もしない

    const supabase = await createClient();
    // 新規作成時は likes=0, status='open' が自動で入ります
    await supabase.from("posts").insert({ title });
    revalidatePath("/");
  };

  // --------------------------------------------------------
  // ▼ 機能2：いいねボタンの処理
  // --------------------------------------------------------
  const addLike = async (formData: FormData) => {
    "use server";
    const id = formData.get("id");
    const supabase = await createClient();
    
    // 今のデータを取得して+1
    const { data: post } = await supabase.from("posts").select("likes").eq("id", id).single();
    if (post) {
      await supabase.from("posts").update({ likes: post.likes + 1 }).eq("id", id);
      revalidatePath("/");
    }
  };

  // --------------------------------------------------------
  // ▼ 機能3：解決済みにする処理
  // --------------------------------------------------------
  const markAsDone = async (formData: FormData) => {
    "use server";
    const id = formData.get("id");
    const supabase = await createClient();
    await supabase.from("posts").update({ status: 'done' }).eq("id", id);
    revalidatePath("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* ▼ ヘッダー */}
      <header className="bg-indigo-600 text-white p-6 shadow-md sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📢 社内目安箱 (Kaizen Box)</h1>
        </div>
      </header>

      <main className="container mx-auto p-6">
        
        {/* ▼ 新規投稿フォームエリア（復活！） */}
        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <h2 className="text-gray-700 font-bold mb-2">💡 新しい改善案を提案する</h2>
          <form action={addPost} className="flex gap-2">
            <input 
              name="title" 
              placeholder="例：オフィスの椅子を良くしてほしい..." 
              className="flex-1 border-2 border-gray-200 rounded-lg p-3 focus:outline-none focus:border-indigo-500 transition"
              required 
            />
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md">
              投稿
            </button>
          </form>
        </div>

        {/* ▼ カード一覧エリア */}
        <h2 className="text-xl text-gray-700 mb-6 border-l-4 border-indigo-500 pl-4 font-bold">
          みんなの声（いいね順）
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <div key={post.id} className={`p-6 rounded-lg shadow-lg border-2 relative transition duration-300 ${post.status === 'done' ? 'bg-gray-100 border-gray-300 opacity-80' : 'bg-white border-white hover:-translate-y-1 hover:shadow-xl'}`}>
              
              {/* ▼ 条件分岐：解決済みならバッジを表示 */}
              {post.status === 'done' && (
                <span className="absolute top-4 right-4 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                  ✅ 解決済み
                </span>
              )}

              {/* 投稿日時 */}
              <p className="text-gray-400 text-xs mb-1">
                {new Date(post.created_at).toLocaleDateString()}
              </p>

              <h3 className={`text-xl font-bold mb-4 mt-1 ${post.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                {post.title}
              </h3>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                
                {/* ▼ いいねボタン */}
                <form action={addLike}>
                  <input type="hidden" name="id" value={post.id} />
                  <button 
                    disabled={post.status === 'done'} // 解決済みなら押せないようにする
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full transition font-bold ${post.status === 'done' ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-pink-500 bg-pink-50 hover:bg-pink-100 hover:scale-110'}`}
                  >
                    <span>❤️ わかる！</span>
                    <span>{post.likes}</span>
                  </button>
                </form>

                {/* ▼ 解決ボタン（未解決のときだけ表示） */}
                {post.status !== 'done' && (
                  <form action={markAsDone}>
                    <input type="hidden" name="id" value={post.id} />
                    <button className="text-xs text-indigo-400 hover:text-indigo-700 font-bold underline decoration-indigo-200 hover:decoration-indigo-700 underline-offset-4">
                      解決済みにする
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}

          {/* データがない場合 */}
          {posts?.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-10">
              まだ投稿がありません。一番乗りで投稿しよう！
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

