# Pages handoff

更新时间：2026-10-10 23:07（Asia/Shanghai）

## Stage D（老街区玩法加深；CBD 仍暂停）
1. **Civic 玩法环**（非空房间）
   - 派出所：报案登记 → 印章柜盖章；求助飞线；可缴乱扔垃圾罚款 ¥50；日间民警小张值班
   - 社区医院：分诊挂号 ¥8 → 诊室问诊 ¥25 → 药房凭处方/自购药（感冒药/创可贴/维C）并回填需求
   - 消防站：参观登记、灭火器讲解/演练解锁 knowledge_extinguisher 安全知识；日间消防员小陈值班
2. **手机**：地图 App 点选 POI 标记（馨园/12号/便利店/地铁/公交/派出所/医院/消防）+ 前往/清除；银行保留流水并显示市民档案小记
3. **街道/住房**：馨园 1F 信报箱改为 mailbox 件 + 楼层索引公告；各层楼梯提示（无电梯）；公交菜单含「跳过车程」与等下一班
4. **NPC 日程**：警察/护士/消防员白天在岗、夜间提示改日再来（js/stageD.js）
5. **质量**：layout civic/xin validate 0；tools/stageD_test.py 18/18；smoke 4/4；stage6 PASS

## 产物
- scene-proto-45.zip / scene-proto-45-play.zip
- 截图：d1-police-report.png d2-hospital-loop.png d3-fire-drill.png d4-phone-map.png d5-bus-board.png d6-xin-corridor.png

## 建议 Stage E
- 把 civic 回执/处方做成可随身物品 + 房东/物业微信联动
- 公交真实到站动画（非纯跳过）与更多线路
- 馨园再增一户差异化户型（阳台/朝向）
- 夜间急诊/接警电话迷你事件
- CBD 仍暂停直至 READY
