// ▼ Vercelのビルドエラー対策
export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server"; // ※環境に合わせて utils か lib か確認

export default async function Home() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from("posts").select().order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ▼ ヘッダー */}
      <header className="bg-indigo-600 text-white p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📢 社内目安箱 (Kaizen Box)</h1>
          <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition">
            新規投稿
          </button>
        </div>
      </header>

      {/* ▼ メインコンテンツ */}
      <main className="container mx-auto p-6">
        <h2 className="text-xl text-gray-700 mb-6 border-l-4 border-indigo-500 pl-4">
          みんなの投稿一覧
        </h2>

        {/* ▼ カード型のリスト表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mr-3">
                  📝
                </div>
                {/* 日付があれば表示、なければ仮表示 */}
                <p className="text-gray-500 text-sm">
                  {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'No Date'}
                </p>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {post.title}
              </h3>
              <p className="text-gray-400 text-sm">ID: {post.id}</p>
            </div>
          ))}

          {/* データがない場合 */}
          {(!posts || posts.length === 0) && (
            <p className="text-gray-500 col-span-full text-center py-10">
              まだ投稿がありません。
            </p>
          )}
        </div>
      </main>
    </div>
  );
}