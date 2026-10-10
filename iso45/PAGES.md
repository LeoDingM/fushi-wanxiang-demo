# Pages handoff

更新时间：2026-10-10 23:12（Asia/Shanghai）

## Stage E（老街区；CBD 仍暂停）
1. **背包 / 物品**：派出所回执、业务章证明、罚款凭证、处方笺、感冒药/创可贴/维C、灭火器卡片；手机「背包」App；药品可使用回填需求；办事后微信联动房东/物业/王阿姨等
2. **公交**：默认车程动画（镜头随路线移动 + 行驶中 HUD，可中途跳过）；另保留「跳过车程」；票价 `prices.bus_fare`
3. **住房**：新增 `room_xin_102` 馨园 1-02（南向飘窗阳台感 + 晾衣架），`1F-xin-b` ¥1180 写入 rent_table / 链居；layout validate 0
4. **夜间迷你事件**：深夜派出所来电（接听/电话补报案/忽略）；夜间急诊提示（去窗口/拨 120/跳过）
5. **质量**：touched rooms validate 0；`tools/stageE_test.py` 15/15；smoke 4/4；stage6 PASS

## 产物
- scene-proto-45.zip / scene-proto-45-play.zip
- 截图：e1-bag-receipt.png e2-bus-ride.png e3-xin-102.png e4-night-call.png e5-wechat-link.png e6-night-clinic.png

## 建议 Stage F
- 背包物品可出示给 NPC（门岗/房东验回执）
- 公交车厢内短场景或到站 bell
- 馨园 1-02 深做封闭阳台碰撞与晾衣规则对接
- 夜间事件写入日志日历、影响次日心情
- CBD 仍暂停直至 READY
