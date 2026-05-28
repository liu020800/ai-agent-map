// 微信 JS-SDK 分享配置（占位）
// 使用前需要：1) 在微信公众平台注册服务号 2) 配置 JS 安全域名 3) 后端生成签名

export interface WechatShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

// 微信 JS-SDK 初始化（当前阶段为占位逻辑）
export async function initWxShare(config: WechatShareConfig): Promise<void> {
  // 未来接入微信 JS-SDK 时使用：
  // 1. 从后端获取 signature
  // 2. wx.config({...})
  // 3. wx.ready(() => { wx.updateAppMessageShareData(...); wx.updateTimelineShareData(...) })

  // 当前阶段：设置微信分享 meta 标签
  if (typeof document !== "undefined") {
    setMetaProperty("og:title", config.title);
    setMetaProperty("og:description", config.desc);
    setMetaProperty("og:image", config.imgUrl);
    setMetaProperty("og:url", config.link);
  }
}

function setMetaProperty(property: string, content: string) {
  if (typeof document === "undefined") return;
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

// 生成 QQ 分享 URL
export function getQQShareUrl(title: string, desc: string, url: string, imageUrl: string): string {
  return `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&pics=${encodeURIComponent(imageUrl)}`;
}

// 生成 QQ 空间分享 URL
export function getQZoneShareUrl(title: string, desc: string, url: string, imageUrl: string): string {
  return `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&pics=${encodeURIComponent(imageUrl)}`;
}

// 生成微博分享 URL
export function getWeiboShareUrl(title: string, url: string, imageUrl?: string): string {
  let shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  if (imageUrl) shareUrl += `&pic=${encodeURIComponent(imageUrl)}`;
  return shareUrl;
}

// 生成分享文案
export function generateShareText(userNumber: number | null, levelName: string, primaryTool: string): string {
  const numberPart = userNumber ? `我是第 ${userNumber} 位` : "我是";
  return `${numberPart} AI Agent 玩家，等级 ${levelName}，主力工具 ${primaryTool}。快来生成你的 AI 身份卡！https://liusq.icu`;
}
