import bcrypt from 'bcryptjs';
import { initDatabase } from '../database/schema';
import db from '../database/connection';
import { familyDAO } from '../database/dao/FamilyDAO';
import { userDAO } from '../database/dao/UserDAO';
import { templateDAO } from '../database/dao/TemplateDAO';
import { prizeDAO } from '../database/dao/PrizeDAO';
import { achievementDAO } from '../database/dao/AchievementDAO';

function seed() {
  console.log('🌱 开始初始化数据...');

  initDatabase();

  // 检查是否已有数据
  if (familyDAO.count() > 0) {
    console.log('数据库已有数据，跳过初始化');
    return;
  }

  const passwordHash = bcrypt.hashSync('123456', 10);

  // 创建家庭
  const family = familyDAO.create({ name: '幸福一家', materialBudget: 3000 });
  console.log(`✅ 创建家庭: ${family.name} (ID: ${family.id})`);

  // 创建用户
  const admin = userDAO.create({
    familyId: family.id,
    username: 'uncle',
    passwordHash,
    name: '叔叔',
    role: 'admin',
    avatar: '👨‍💻',
  });
  console.log(`✅ 创建管理员: ${admin.name} (用户名: uncle, 密码: 123456)`);

  const parent1 = userDAO.create({
    familyId: family.id,
    username: 'papa',
    passwordHash,
    name: '爸爸',
    role: 'parent',
    avatar: '👨',
  });
  console.log(`✅ 创建家长: ${parent1.name} (用户名: papa, 密码: 123456)`);

  const parent2 = userDAO.create({
    familyId: family.id,
    username: 'mama',
    passwordHash,
    name: '妈妈',
    role: 'parent',
    avatar: '👩',
  });
  console.log(`✅ 创建家长: ${parent2.name} (用户名: mama, 密码: 123456)`);

  const child = userDAO.create({
    familyId: family.id,
    username: 'baobao',
    passwordHash: bcrypt.hashSync('1234', 10),
    name: '宝贝',
    role: 'child',
    avatar: '👧',
    pin: '1234',
  });
  console.log(`✅ 创建孩子: ${child.name} (PIN: 1234)`);

  // ==================== 行为模板 ====================

  // 第一层：日常习惯（高频低分）
  const lifeTemplates = [
    { name: '早起积极语', points: 3, icon: '☀️', description: '起床后大声说"美好的一天开始啦！"' },
    { name: '自己刷牙洗脸', points: 3, icon: '🪥', description: '独立完成刷牙洗脸' },
    { name: '自己穿衣服', points: 2, icon: '👕', description: '自己选衣服穿好' },
    { name: '按时睡觉', points: 3, icon: '😴', description: '9点前上床睡觉' },
    { name: '好好吃饭', points: 3, icon: '🍚', description: '不挑食好好吃饭' },
    { name: '整理书包/玩具', points: 3, icon: '🧸', description: '自己收拾整理好' },
    { name: '自己洗手', points: 2, icon: '🧼', description: '饭前便后主动洗手' },
    { name: '帮家人做家务', points: 5, icon: '🧹', description: '洗碗/扫地/擦桌子等' },
  ];

  for (const t of lifeTemplates) {
    templateDAO.create({ familyId: family.id, category: 'life', ...t });
  }
  console.log(`✅ 创建生活习惯模板 ${lifeTemplates.length} 个`);

  // 第二层：主修技能（钢琴 + 阅读/古诗/识字）
  const learnTemplates = [
    // 🎹 钢琴系列
    { name: '练琴打卡（30分钟）', points: 8, icon: '🎹', description: '完成当天练琴≥30分钟' },
    { name: '练琴满1小时', points: 12, icon: '🎹', description: '练琴超过1小时，额外奖励' },
    { name: '学会新曲子', points: 30, icon: '🎶', description: '完整弹出一首新曲子' },
    { name: '通过老师考核', points: 50, icon: '✅', description: '老师认可进入下一阶段' },
    { name: '钢琴公开表演', points: 100, icon: '🎤', description: '在家人/朋友/比赛中表演' },
    // 📖 阅读/古诗/识字系列
    { name: '每日阅读打卡', points: 5, icon: '📖', description: '读绘本/识字≥15分钟' },
    { name: '读完一本绘本', points: 10, icon: '📚', description: '完整读完一本绘本' },
    { name: '能复述故事', points: 15, icon: '🗣️', description: '读完后能复述故事大意' },
    { name: '背会新古诗', points: 15, icon: '📜', description: '完整背诵一首新古诗' },
    { name: '认识10个新字', points: 10, icon: '📝', description: '累计认识10个新汉字' },
    { name: '自主阅读一本书', points: 25, icon: '🏅', description: '不需大人帮忙独立看完一本书' },
    { name: '给家人讲故事', points: 20, icon: '👨‍👩‍👧', description: '自己组织语言给家人讲一个故事' },
    // 其他学习
    { name: '完成绘画', points: 8, icon: '🎨', description: '完成一幅画作' },
    { name: '学英语单词', points: 5, icon: '🔤', description: '学会新的英语单词' },
    { name: '学会数学概念', points: 8, icon: '🔢', description: '掌握新的数学概念' },
  ];

  for (const t of learnTemplates) {
    templateDAO.create({ familyId: family.id, category: 'learn', ...t });
  }
  console.log(`✅ 创建学习技能模板 ${learnTemplates.length} 个`);

  // 第三层：社交品格
  const socialTemplates = [
    { name: '主动分享', points: 5, icon: '🤝', description: '主动和小朋友/家人分享' },
    { name: '主动打招呼', points: 3, icon: '👋', description: '见到人主动问好' },
    { name: '帮助小朋友', points: 8, icon: '💪', description: '在幼儿园帮助同学' },
    { name: '用语言表达情绪', points: 8, icon: '🧠', description: '不哭闹，说出"我觉得…"' },
    { name: '说谢谢/对不起', points: 3, icon: '🙏', description: '主动使用礼貌用语' },
    { name: '耐心等待', points: 5, icon: '⏳', description: '排队/等待时不催不闹' },
    { name: '主动道歉', points: 8, icon: '💝', description: '做错事后主动承认并道歉' },
  ];

  for (const t of socialTemplates) {
    templateDAO.create({ familyId: family.id, category: 'social', ...t });
  }
  console.log(`✅ 创建社交品格模板 ${socialTemplates.length} 个`);

  // 第四层：特别成就（里程碑）
  const achievementTemplates = [
    { name: '钢琴学完一本教材', points: 200, icon: '🎹', description: '完成一本钢琴教材全部曲目' },
    { name: '累计背诵50首古诗', points: 150, icon: '📜', description: '古诗积累达到50首' },
    { name: '累计背诵100首古诗', points: 300, icon: '👏', description: '古诗积累达到100首' },
    { name: '独立讲完整故事', points: 50, icon: '📚', description: '讲一个有起承转合的完整故事' },
    { name: '学会骑自行车', points: 80, icon: '🚲', description: '学会骑自行车' },
    { name: '学会游泳', points: 80, icon: '🏊', description: '学会基本游泳' },
    { name: '在众人面前表演', points: 60, icon: '🎭', description: '勇敢在大家面前表演节目' },
    { name: '坚持某习惯30天', points: 100, icon: '🏆', description: '任何一个好习惯坚持满30天' },
    { name: '第一次做饭/烘焙', points: 50, icon: '🧁', description: '在家人指导下完成烹饪/烘焙' },
    { name: '坚持练琴14天', points: 80, icon: '🔥', description: '连续14天完成练琴打卡' },
    { name: '坚持阅读14天', points: 60, icon: '📖', description: '连续14天完成阅读打卡' },
  ];

  for (const t of achievementTemplates) {
    templateDAO.create({ familyId: family.id, category: 'achievement', ...t });
  }
  console.log(`✅ 创建特别成就模板 ${achievementTemplates.length} 个`);

  // ==================== 奖品商城 ====================
  const prizes = [
    // 小奖（≤100积分）—— 特权 & 小物件
    { name: '选择晚餐菜单', pointsCost: 15, materialCost: 0, tier: 'small', type: 'virtual', description: '今天晚餐你来决定吃什么', stock: -1 },
    { name: '看一集喜欢的动画', pointsCost: 15, materialCost: 0, tier: 'small', type: 'virtual', description: '自选一集动画片', stock: -1 },
    { name: '和叔叔视频通话', pointsCost: 20, materialCost: 0, tier: 'small', type: 'virtual', description: '和叔叔视频通话30分钟', stock: -1 },
    { name: '晚睡30分钟', pointsCost: 20, materialCost: 0, tier: 'small', type: 'virtual', description: '今晚可以晚睡30分钟', stock: -1 },
    { name: '选一个冰淇淋', pointsCost: 25, materialCost: 5, tier: 'small', type: 'material', description: '选一个喜欢的冰淇淋', stock: -1 },
    { name: '贴纸书', pointsCost: 30, materialCost: 15, tier: 'small', type: 'material', description: '一本可爱的贴纸书', stock: 5 },
    { name: '小发卡/小饰品', pointsCost: 30, materialCost: 15, tier: 'small', type: 'material', description: '自选一个小饰品', stock: 5 },
    { name: '和爸妈玩桌游1小时', pointsCost: 30, materialCost: 0, tier: 'small', type: 'virtual', description: '爸爸或妈妈陪玩桌游1小时', stock: -1 },
    { name: '彩泥套装', pointsCost: 40, materialCost: 20, tier: 'small', type: 'material', description: '12色彩泥套装', stock: 3 },
    // 中奖（101-500积分）
    { name: '叔叔画一幅定制画', pointsCost: 100, materialCost: 0, tier: 'medium', type: 'virtual', description: '叔叔给你画一幅你想要的画', stock: -1 },
    { name: '邀请好朋友来家里玩', pointsCost: 120, materialCost: 50, tier: 'medium', type: 'material', description: '准备零食和游戏招待好朋友', stock: -1 },
    { name: '水彩笔/画笔套装', pointsCost: 120, materialCost: 50, tier: 'medium', type: 'material', description: '36色水彩笔或画笔', stock: 2 },
    { name: '绘本套装', pointsCost: 150, materialCost: 80, tier: 'medium', type: 'material', description: '5本精选绘本', stock: 2 },
    { name: '看一场电影', pointsCost: 150, materialCost: 60, tier: 'medium', type: 'material', description: '和家人一起去看电影', stock: -1 },
    { name: '新书包/文具盒', pointsCost: 150, materialCost: 80, tier: 'medium', type: 'material', description: '自选一个新书包或文具盒', stock: 1 },
    { name: '去公园野餐', pointsCost: 200, materialCost: 100, tier: 'medium', type: 'material', description: '和家人一起去公园野餐', stock: -1 },
    { name: '自选一个玩具（100元内）', pointsCost: 200, materialCost: 100, tier: 'medium', type: 'material', description: '自己挑选一个100元以内的玩具', stock: -1 },
    // 大奖（501-2000积分）
    { name: '乐高积木', pointsCost: 600, materialCost: 200, tier: 'large', type: 'material', description: '乐高经典创意积木', stock: 1 },
    { name: '儿童相机', pointsCost: 600, materialCost: 200, tier: 'large', type: 'material', description: '儿童数码相机', stock: 1 },
    { name: '新裙子/新鞋（自选）', pointsCost: 800, materialCost: 250, tier: 'large', type: 'material', description: '自己挑选一条新裙子或一双新鞋', stock: -1 },
    { name: '动物园/水族馆', pointsCost: 800, materialCost: 300, tier: 'large', type: 'material', description: '和家人一起去动物园或水族馆', stock: -1 },
    { name: '游乐园一日游', pointsCost: 1000, materialCost: 400, tier: 'large', type: 'material', description: '和家人一起去游乐园玩一天', stock: -1 },
    { name: '周末短途旅行', pointsCost: 1500, materialCost: 600, tier: 'large', type: 'material', description: '周末和家人一起短途旅行', stock: -1 },
    // 超级奖（>2000积分）
    { name: '自选大礼物（300元内）', pointsCost: 2500, materialCost: 300, tier: 'super', type: 'material', description: '自己挑选一个300元以内的大礼物', stock: -1 },
    { name: '迪士尼/长隆乐园', pointsCost: 3000, materialCost: 800, tier: 'super', type: 'material', description: '一次迪士尼或长隆乐园之旅', stock: 1 },
    { name: '一次特别旅行', pointsCost: 5000, materialCost: 1500, tier: 'super', type: 'material', description: '去一个一直想去的地方旅行', stock: 1 },
  ];

  for (const p of prizes) {
    prizeDAO.create({ familyId: family.id, ...p });
  }
  console.log(`✅ 创建奖品 ${prizes.length} 个`);

  // ==================== 成就系统 ====================
  const achievements = [
    // 积分里程碑
    { name: '初出茅庐', description: '获得第一个积分', icon: '🌟', conditionType: 'total_points', conditionValue: 1 },
    { name: '百分小达人', description: '累计获得100分', icon: '💯', conditionType: 'total_points', conditionValue: 100 },
    { name: '五百分大关', description: '累计获得500分', icon: '🥇', conditionType: 'total_points', conditionValue: 500 },
    { name: '千分之星', description: '累计获得1000分', icon: '⭐', conditionType: 'total_points', conditionValue: 1000 },
    { name: '积分女王', description: '累计获得5000分', icon: '👑', conditionType: 'total_points', conditionValue: 5000 },
    // 连续打卡
    { name: '坚持三天', description: '连续打卡3天', icon: '🔥', conditionType: 'consecutive_days', conditionValue: 3 },
    { name: '一周之星', description: '连续打卡7天', icon: '🌈', conditionType: 'consecutive_days', conditionValue: 7 },
    { name: '两周达人', description: '连续打卡14天', icon: '💎', conditionType: 'consecutive_days', conditionValue: 14 },
    { name: '月度之星', description: '连续打卡30天', icon: '🌙', conditionType: 'consecutive_days', conditionValue: 30 },
    // 分类达成
    { name: '生活小能手', description: '完成30次生活习惯', icon: '🏠', conditionType: 'life_count', conditionValue: 30 },
    { name: '学习小达人', description: '完成30次学习技能', icon: '📚', conditionType: 'learn_count', conditionValue: 30 },
    { name: '社交小明星', description: '完成15次社交品格', icon: '🌈', conditionType: 'social_count', conditionValue: 15 },
    { name: '成就收割机', description: '完成5次特别成就', icon: '🏆', conditionType: 'achievement_count', conditionValue: 5 },
    // 总记录
    { name: '百事通', description: '累计记录100次行为', icon: '🎯', conditionType: 'total_records', conditionValue: 100 },
    { name: '千次达人', description: '累计记录500次行为', icon: '🗂️', conditionType: 'total_records', conditionValue: 500 },
  ];

  const achievementInsert = db.prepare(`
    INSERT INTO achievements (family_id, name, description, icon, condition_type, condition_value)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const a of achievements) {
    achievementInsert.run(family.id, a.name, a.description, a.icon, a.conditionType, a.conditionValue);
  }
  console.log(`✅ 创建成就 ${achievements.length} 个`);

  console.log('\n🎉 数据初始化完成！');
  console.log('\n📋 账号信息：');
  console.log('  叔叔（管理员）: uncle / 123456');
  console.log('  爸爸（家长）: papa / 123456');
  console.log('  妈妈（家长）: mama / 123456');
  console.log('  宝贝（孩子）: PIN码 1234');
}

seed();
