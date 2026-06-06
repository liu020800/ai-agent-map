import { PageShell, Section } from "@/components/ui";

export const metadata = {
  title: "用户协议",
  description: "AI Agent Map 用户协议",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Section spacing="sm">
        <PageShell>
          <article className="mx-auto max-w-3xl rounded-3xl border border-violet-300/14 bg-black/40 p-6 leading-8 text-white/72 backdrop-blur-xl sm:p-8">
            <p className="title-font text-[11px] uppercase tracking-[0.32em] text-violet-300">Terms</p>
            <h1 className="title-font mt-3 text-4xl font-black text-white">用户协议</h1>

            <h2 className="mt-8 text-xl font-bold text-white">服务说明</h2>
            <p className="mt-3">本站提供 AI Agent 身份卡生成、用户地图统计、排行榜 / 趋势展示和分享页面等互动功能。</p>

            <h2 className="mt-8 text-xl font-bold text-white">用户承诺</h2>
            <p className="mt-3">用户不得提交违法违规内容、侵犯他人权益的内容、广告垃圾信息、恶意攻击内容、冒充他人身份的信息，以及涉及隐私、身份证号、手机号、住址等敏感信息。</p>

            <h2 className="mt-8 text-xl font-bold text-white">AI 生成内容说明</h2>
            <p className="mt-3">身份卡图片由 AI 模型根据用户输入生成，可能存在文字不准确、视觉偏差或生成失败的情况。生成内容仅供娱乐、展示和分享使用，不构成任何身份认证或官方证明。</p>

            <h2 className="mt-8 text-xl font-bold text-white">内容处理权</h2>
            <p className="mt-3">站长有权删除违规内容、异常数据、刷量数据或影响网站正常运行的内容。</p>

            <h2 className="mt-8 text-xl font-bold text-white">免责声明</h2>
            <p className="mt-3">本站是个人兴趣项目，不保证服务持续无中断，不对因使用本站产生的间接损失负责。</p>

            <h2 className="mt-8 text-xl font-bold text-white">联系方式</h2>
            <p className="mt-3">如需反馈问题、删除数据或联系站长，请通过页脚邮箱发送身份卡 ID 和问题说明。</p>
          </article>
        </PageShell>
      </Section>
    </main>
  );
}
