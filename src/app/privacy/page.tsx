import { PageShell, Section } from "@/components/ui";

export const metadata = {
  title: "隐私政策",
  description: "AI Agent Map 隐私政策",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Section spacing="sm">
        <PageShell>
          <article className="mx-auto max-w-3xl rounded-3xl border border-cyan-300/14 bg-black/40 p-6 leading-8 text-white/72 backdrop-blur-xl sm:p-8">
            <p className="title-font text-[11px] uppercase tracking-[0.32em] text-cyan-300">Privacy Policy</p>
            <h1 className="title-font mt-3 text-4xl font-black text-white">隐私政策</h1>
            <p className="mt-4">AI Agent Map 是一个个人互动网站，用于生成 AI Agent 身份卡、展示地图统计、排行榜和分享页面。</p>

            <h2 className="mt-8 text-xl font-bold text-white">我们收集的信息</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>昵称、省份 / 城市、用户选择的 AI 工具、使用场景、签名。</li>
              <li>生成的身份卡图片、身份卡 ID、浏览器 visitorId。</li>
              <li>基础访问日志，例如访问时间、浏览器信息、IP，用于安全和防刷。</li>
            </ul>
            <p className="mt-3 font-semibold text-cyan-100">本站不要求用户提供真实姓名、手机号、身份证号、人脸照片或精确地址。</p>

            <h2 className="mt-8 text-xl font-bold text-white">信息用途</h2>
            <p className="mt-3">我们使用这些信息生成 AI Agent 身份卡、展示用户主动提交的地图统计、生成分享页面、防止恶意刷图和滥用接口，并改善网站体验。</p>

            <h2 className="mt-8 text-xl font-bold text-white">公开展示说明</h2>
            <p className="mt-3">用户提交的昵称、地区、工具选择、签名和生成的身份卡，可能会在身份卡页面、排行榜、地图统计或分享页面中展示。请不要填写真实敏感个人信息。</p>

            <h2 className="mt-8 text-xl font-bold text-white">第三方服务</h2>
            <p className="mt-3">本站可能调用 SenseNova U1 Fast 等第三方模型服务生成身份卡图片。为了完成图片生成，我们会将用户填写的昵称、地区、工具和签名等必要信息发送给相关服务。</p>

            <h2 className="mt-8 text-xl font-bold text-white">数据删除</h2>
            <p className="mt-3">如需删除身份卡或相关数据，请通过页面提供的联系方式联系站长，并提供身份卡 ID。</p>

            <h2 className="mt-8 text-xl font-bold text-white">未成年人</h2>
            <p className="mt-3">如果你是未成年人，请在监护人同意后使用本站。</p>

            <h2 className="mt-8 text-xl font-bold text-white">政策更新</h2>
            <p className="mt-3">本隐私政策可能会根据功能变化进行更新，更新后会在本站页面展示。</p>
          </article>
        </PageShell>
      </Section>
    </main>
  );
}
