# 手机微信 · `SP.phone.aiChat` 接入说明

Stage B/C 起，微信回复先走脚本池（`A.threads()` 里每条 `them` 可为字符串数组，运行时 `A._pick` 随机），再可选询问 LLM。

## 钩子签名

```js
/**
 * @param {object} ctx
 * @param {string} ctx.threadId   会话 id（landlord / aunt / agent / …）
 * @param {string} ctx.userText   玩家刚点的回复文案
 * @param {Array<{who:string,text:string}>} ctx.history  当前会话消息（含刚插入的 me）
 * @param {string} [ctx.replyId]  脚本选项 id
 * @returns {string|null|Promise<string|null>}
 *   - string：作为 NPC 气泡
 *   - null/undefined：回退脚本 `them` 变体
 */
SP.phone.aiChat = function (ctx) { return null; };
```

默认实现在 `js/stageA.js`：始终 `return null`（**不调用任何外部 API**）。

## 本地免费模式（推荐开发机）

若本机有 Ollama 等 OpenAI 兼容接口：

```js
SP.phone.aiChat = async function (ctx) {
  const system = "你是浮世万象里的 NPC，用简体中文短回复（1–2 句），口语、生活化，不要剧透系统。";
  const who = (SP.stageA.threads()[ctx.threadId] || {}).title || ctx.threadId;
  const messages = [
    { role: "system", content: system + " 你现在扮演：" + who },
    ...ctx.history.slice(-8).map((m) => ({
      role: m.who === "me" ? "user" : "assistant",
      content: m.text
    })),
    { role: "user", content: ctx.userText }
  ];
  try {
    const r = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "qwen2.5:7b", messages, temperature: 0.8 })
    });
    if (!r.ok) return null;
    const j = await r.json();
    return (j.choices && j.choices[0].message.content || "").trim() || null;
  } catch (e) {
    return null; // 失败则脚本兜底
  }
};
```

在浏览器控制台、或单独的 `js/phone_ai_local.js`（自行在 `index.html` 于 `stageA.js` **之后**引入）里赋值即可。

## 云端 API（需你自备密钥）

```js
SP.phone.aiChat = async function (ctx) {
  const key = window.LOCAL_LLM_KEY; // 切勿把密钥写进仓库
  if (!key) return null;
  const r = await fetch("https://api.example.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + key
    },
    body: JSON.stringify({
      model: "your-model",
      messages: [
        { role: "system", content: "简体中文短回复，扮演：" + ctx.threadId },
        { role: "user", content: ctx.userText }
      ]
    })
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j.choices?.[0]?.message?.content?.trim() || null;
};
```

**注意：** 默认 Pages/zip 构建不会带密钥、不会发外网请求。正式上线请走自有后端代理，避免暴露 key。

## 与脚本池的关系

1. 玩家点选项 → `A.replyChat` 推入 `me` 气泡
2. 调用 `SP.phone.aiChat(ctx)`（同步或 Promise）
3. 有返回文本 → 用 LLM 句；否则 `A._pick(reply.them)`
4. 特殊 `act: "pay_rent"` 走银行转账逻辑，不经 LLM

扩展台词：继续往 `A.threads()` 的 `them: [...]` 数组加句子即可，无需 LLM。
