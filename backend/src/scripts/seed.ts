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

  // 创建行为模板 - 生活习惯类
  const lifeTemplates = [
    { name: '自己刷牙', points: 1, icon: '🪥', description: '自己完成刷牙' },
    { name: '自己穿衣服', points: 1, icon: '👕', description: '自己穿好衣服' },
    { name: '按时睡觉', points: 2, icon: '😴', description: '按时上床睡觉' },
    { name: '好好吃饭', points: 2, icon: '🍚', description: '不挑食好好吃饭' },
    { name: '收拾玩具', points: 1, icon: '🧸', description: '自己收拾玩具' },
    { name: '自己洗手', points: 1, icon: '🧼', description: '主动洗手' },
  ];

  for (const t of lifeTemplates) {
    templateDAO.create({ familyId: family.id, category: 'life', ...t });
  }
  console.log(`✅ 创建生活习惯模板 ${lifeTemplates.length} 个`);

  // 创建行为模板 - 学习技能类
  const learnTemplates = [
    { name: '认识新字', points: 3, icon: '📝', description: '认识了新的汉字' },
    { name: '学会新儿歌', points: 5, icon: '🎵', description: '学会一首新儿歌' },
    { name: '完成绘画', points: 4, icon: '🎨', description: '完成一幅画作' },
    { name: '学会数学', points: 4, icon: '🔢', description: '掌握新的数学概念' },
    { name: '读绘本', points: 3, icon: '📖', description: '读完一本绘本' },
    { name: '学英语单词', points: 3, icon: '🔤', description: '学会新的英语单词' },
  ];

  for (const t of learnTemplates) {
    templateDAO.create({ familyId: family.id, category: 'learn', ...t });
  }
  console.log(`✅ 创建学习技能模板 ${learnTemplates.length} 个`);

  // 创建行为模板 - 社交品格类
  const socialTemplates = [
    { name: '主动分享', points: 5, icon: '🤝', description: '主动和小朋友分享' },
    { name: '帮助家人', points: 6, icon: '💪', description: '帮助家人做事' },
    { name: '主动打招呼', points: 5, icon: '👋', description: '见到人主动打招呼' },
    { name: '不哭闹解决问题', points: 8, icon: '🧠', description: '遇到困难不哭闹想办法解决' },
    { name: '说谢谢', points: 5, icon: '🙏', description: '主动说谢谢' },
  ];

  for (const t of socialTemplates) {
    templateDAO.create({ familyId: family.id, category: 'social', ...t });
  }
  console.log(`✅ 创建社交品格模板 ${socialTemplates.length} 个`);

  // 创建行为模板 - 特别成就类
  const achievementTemplates = [
    { name: '学会骑自行车', points: 50, icon: '🚲', description: '学会骑自行车' },
    { name: '独立讲故事', points: 30, icon: '📚', description: '自己完整讲一个故事' },
    { name: '坚持习惯30天', points: 50, icon: '🏆', description: '坚持某个好习惯满30天' },
    { name: '第一次游泳', points: 40, icon: '🏊', description: '第一次下水游泳' },
    { name: '表演节目', points: 30, icon: '🎭', description: '在大家面前表演节目' },
  ];

  for (const t of achievementTemplates) {
    templateDAO.create({ familyId: family.id, category: 'achievement', ...t });
  }
  console.log(`✅ 创建特别成就模板 ${achievementTemplates.length} 个`);

  // 创建奖品
  const prizes = [
    // 小奖
    { name: '贴纸书', pointsCost: 20, materialCost: 25, tier: 'small', type: 'material', description: '一本可爱的贴纸书', stock: 5 },
    { name: '小玩偶', pointsCost: 20, materialCost: 25, tier: 'small', type: 'material', description: '毛绒小玩偶', stock: 3 },
    { name: '彩泥套装', pointsCost: 20, materialCost: 20, tier: 'small', type: 'material', description: '12色彩泥', stock: 3 },
    // 中奖
    { name: '绘本套装', pointsCost: 80, materialCost: 100, tier: 'medium', type: 'material', description: '5本精选绘本', stock: 2 },
    { name: '水彩笔套装', pointsCost: 80, materialCost: 90, tier: 'medium', type: 'material', description: '36色水彩笔', stock: 2 },
    { name: '拼图', pointsCost: 80, materialCost: 80, tier: 'medium', type: 'material', description: '100片卡通拼图', stock: 2 },
    // 大奖
    { name: '乐高积木', pointsCost: 200, materialCost: 250, tier: 'large', type: 'material', description: '乐高经典创意积木', stock: 1 },
    { name: '儿童相机', pointsCost: 200, materialCost: 200, tier: 'large', type: 'material', description: '儿童数码相机', stock: 1 },
    // 超级奖
    { name: '游乐园一日游', pointsCost: 500, materialCost: 600, tier: 'super', type: 'material', description: '和家人一起去游乐园', stock: 1 },
    // 虚拟奖品
    { name: '和叔叔视频通话', pointsCost: 15, materialCost: 0, tier: 'small', type: 'virtual', description: '和叔叔视频通话30分钟想玩什么都行', stock: -1 },
    { name: '叔叔画一幅画', pointsCost: 30, materialCost: 0, tier: 'small', type: 'virtual', description: '叔叔给你画一幅你想要的画', stock: -1 },
    { name: '超级宝贝称号', pointsCost: 50, materialCost: 0, tier: 'medium', type: 'virtual', description: '获得"超级宝贝"特别称号一周', stock: -1 },
    { name: '选择晚餐菜单', pointsCost: 10, materialCost: 0, tier: 'small', type: 'virtual', description: '今天晚餐你来决定吃什么', stock: -1 },
  ];

  for (const p of prizes) {
    prizeDAO.create({ familyId: family.id, ...p });
  }
  console.log(`✅ 创建奖品 ${prizes.length} 个`);

  // 创建成就
  const achievements = [
    { name: '初出茅庐', description: '获得第一个积分', icon: '🌟', conditionType: 'total_points', conditionValue: 1 },
    { name: '积分达人', description: '累计获得100分', icon: '💯', conditionType: 'total_points', conditionValue: 100 },
    { name: '积分之王', description: '累计获得500分', icon: '👑', conditionType: 'total_points', conditionValue: 500 },
    { name: '坚持三天', description: '连续打卡3天', icon: '🔥', conditionType: 'consecutive_days', conditionValue: 3 },
    { name: '一周之星', description: '连续打卡7天', icon: '⭐', conditionType: 'consecutive_days', conditionValue: 7 },
    { name: '月度之星', description: '连续打卡30天', icon: '🌙', conditionType: 'consecutive_days', conditionValue: 30 },
    { name: '生活小能手', description: '完成20次生活习惯', icon: '🏠', conditionType: 'life_count', conditionValue: 20 },
    { name: '学习小达人', description: '完成15次学习技能', icon: '📚', conditionType: 'learn_count', conditionValue: 15 },
    { name: '社交小明星', description: '完成10次社交品格', icon: '🌈', conditionType: 'social_count', conditionValue: 10 },
    { name: '百事通', description: '累计记录50次行为', icon: '🎯', conditionType: 'total_records', conditionValue: 50 },
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
