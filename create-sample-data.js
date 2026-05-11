const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function createSampleData() {
  try {
    console.log('=== 创建示例数据 ===\n');

    // 1. 创建病历账本示例
    console.log('1. 创建病历账本记录...');
    const medicalRecord = await db.namedLedger.create({
      data: {
        userId: 'cmggkko6k0004qjiaunea7gfz', // 张三
        ledgerType: 'medical',
        content: '右腿髋关节重伤瘫痪，需要长期康复治疗',
        specialData: JSON.stringify({
          diseaseType: '髋关节重伤',
          cause: '10岁时被村霸儿子从房檐推下摔伤',
          diagnosis: '右腿髋关节粉碎性骨折，导致瘫痪',
          treatment: '长期康复治疗，物理治疗，药物治疗',
          medication: '止痛药，肌肉松弛剂',
          hospital: '县人民医院',
          doctor: '王医生',
          startDate: '2000-03-15',
          severity: 'severe',
          isChronic: true,
          needsHelp: true,
          helpType: '需要康复设备费用，护理服务，定期医疗检查'
        }),
        tags: JSON.stringify(['瘫痪', '髋关节重伤', '慢性病']),
        privacy: 'selective',
        status: 'verified',
        value: 45
      }
    });
    console.log(`✅ 病历记录创建成功: ${medicalRecord.content}`);

    // 2. 创建梦境账本示例
    console.log('\n2. 创建梦境账本记录...');
    const dreamRecord1 = await db.namedLedger.create({
      data: {
        userId: 'cmggkko6k0004qjiaunea7gfz', // 张三
        ledgerType: 'dream',
        content: '希望能够重新站立行走，恢复正常生活',
        specialData: JSON.stringify({
          dreamType: 'health',
          dreamTitle: '重新站立的梦想',
          description: '通过先进的医疗技术和康复训练，希望能够重新恢复行走能力',
          motivation: '想要过上正常人的生活，不再依赖他人照顾',
          targetDate: '2026-12-31',
          requiredResources: ['先进医疗技术', '康复设备', '专业护理', '资金支持'],
          currentProgress: 15,
          actionSteps: ['寻找更好的医疗资源', '进行康复训练', '筹集医疗费用', '保持积极心态'],
          obstacles: ['医疗费用高昂', '康复过程漫长', '缺乏专业设备'],
          supportNeeded: ['医疗资金', '康复指导', '心理支持'],
          expectedImpact: '能够自理生活，减轻家庭负担，重新融入社会',
          priority: 'high',
          isShared: true,
          collaboration: true
        }),
        tags: JSON.stringify(['健康梦想', '康复', '行走']),
        privacy: 'public',
        status: 'pending',
        value: 55
      }
    });
    console.log(`✅ 梦境记录创建成功: ${dreamRecord1.content}`);

    const dreamRecord2 = await db.namedLedger.create({
      data: {
        userId: 'cmggkko6k0005qjian5ye9wn1', // 李四
        ledgerType: 'dream',
        content: '创建农村残疾人互联网技术培训学校',
        specialData: JSON.stringify({
          dreamType: 'social',
          dreamTitle: '农村互联网技术培训',
          description: '建立专门为农村和残疾人提供互联网技术培训的学校',
          motivation: '帮助农村残疾人掌握技能，获得就业机会',
          targetDate: '2025-08-31',
          requiredResources: ['场地', '电脑设备', '师资', '课程开发'],
          currentProgress: 30,
          actionSteps: ['寻找合适场地', '筹集设备资金', '招聘教师', '开发课程'],
          obstacles: ['资金不足', '师资缺乏', '学员招生'],
          supportNeeded: ['资金支持', '技术指导', '宣传推广'],
          expectedImpact: '帮助100名农村残疾人掌握技能，实现就业',
          priority: 'high',
          isShared: true,
          collaboration: true
        }),
        tags: JSON.stringify(['社会梦想', '教育', '技术培训']),
        privacy: 'public',
        status: 'verified',
        value: 65
      }
    });
    console.log(`✅ 梦境记录创建成功: ${dreamRecord2.content}`);

    // 3. 创建实账本示例
    console.log('\n3. 创建实账本记录...');
    const realityRecord1 = await db.namedLedger.create({
      data: {
        userId: 'cmggkko6k0004qjiaunea7gfz', // 张三
        ledgerType: 'reality',
        content: '22年来坚持自学互联网技术，虽然身体残疾但从未放弃',
        specialData: JSON.stringify({
          realityType: 'struggle',
          eventTitle: '22年自学之路',
          eventDate: '2003-01-01',
          location: '家中',
          participants: ['自己', '家人'],
          detailedDescription: '从2003年开始，通过互联网自学编程、设计、网络技术等，虽然身体瘫痪，但坚持每天学习',
          emotionalImpact: '虽然过程艰难，但获得了知识和技能，增强了自信心',
          lessonsLearned: '身体残疾不能阻挡学习，只要有决心就能掌握技能',
          evidence: ['学习笔记', '作品集', '证书'],
          witnesses: ['家人', '网友'],
          consequences: ['掌握了多种技能', '能够独立工作', '获得了收入来源'],
          resolution: '通过坚持不懈的努力，成功掌握了互联网技术',
          currentStatus: '持续学习和提升中',
          futureOutlook: '希望能够帮助更多农村残疾人学习技术',
          authenticity: 'verified',
          impact: 'personal'
        }),
        tags: JSON.stringify(['奋斗经历', '自学', '技术']),
        privacy: 'public',
        status: 'applied',
        value: 60
      }
    });
    console.log(`✅ 实账本记录创建成功: ${realityRecord1.content}`);

    const realityRecord2 = await db.namedLedger.create({
      data: {
        userId: 'cmggkko6k0005qjian5ye9wn1', // 李四
        ledgerType: 'reality',
        content: '帮助农村残疾人销售农产品，成功增收5万元',
        specialData: JSON.stringify({
          realityType: 'achievement',
          eventTitle: '助农增收成功案例',
          eventDate: '2024-06-15',
          location: '某村',
          participants: ['李四', '5户残疾人家庭'],
          detailedDescription: '通过电商平台和直播带货，帮助5户残疾人家庭销售农产品，总销售额达到5万元',
          emotionalImpact: '看到残疾人朋友增收，感到非常欣慰和有成就感',
          lessonsLearned: '互联网技术可以帮助农村残疾人实现增收',
          evidence: ['销售记录', '银行流水', '感谢信'],
          witnesses: ['村民', '买家', '村干部'],
          consequences: ['残疾人家庭增收', '提升了信心', '带动了其他村民'],
          resolution: '成功建立了农产品销售渠道',
          currentStatus: '持续合作中',
          futureOutlook: '希望能够帮助更多残疾人家庭',
          authenticity: 'verified',
          impact: 'community'
        }),
        tags: JSON.stringify(['成就记录', '助农', '电商']),
        privacy: 'public',
        status: 'verified',
        value: 50
      }
    });
    console.log(`✅ 实账本记录创建成功: ${realityRecord2.content}`);

    // 4. 更新用户账户余额
    console.log('\n4. 更新用户账户余额...');
    
    // 张三的共同体账户增加
    await db.user.update({
      where: { id: 'cmggkko6k0004qjiaunea7gfz' },
      data: {
        communityBalance: {
          increment: 50 // 病历记录30% + 梦境记录20%
        }
      }
    });

    // 李四的投资点数增加
    await db.user.update({
      where: { id: 'cmggkko6k0005qjian5ye9wn1' },
      data: {
        investmentPoints: {
          increment: 20 // 梦境合作10% + 实账本10%
        }
      }
    });

    console.log('\n=== 示例数据创建完成 ===');
    console.log('✅ 病历账本: 1条记录');
    console.log('✅ 梦境账本: 2条记录');
    console.log('✅ 实账本: 2条记录');
    console.log('✅ 用户账户已更新');
    
  } catch (error) {
    console.error('创建示例数据失败:', error);
  } finally {
    await db.$disconnect();
  }
}

createSampleData();