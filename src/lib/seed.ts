import { db } from './db'

async function main() {
  // 创建默认分类
  const categories = await Promise.all([
    db.category.upsert({
      where: { name: '乡村基建' },
      update: {},
      create: {
        name: '乡村基建',
        description: '支持农村基础设施建设',
        icon: '🏗️'
      }
    }),
    db.category.upsert({
      where: { name: '残障创业' },
      update: {},
      create: {
        name: '残障创业',
        description: '帮助残障人士创业就业',
        icon: '♿'
      }
    }),
    db.category.upsert({
      where: { name: '教育助学' },
      update: {},
      create: {
        name: '教育助学',
        description: '资助贫困学生完成学业',
        icon: '📚'
      }
    }),
    db.category.upsert({
      where: { name: '医疗救助' },
      update: {},
      create: {
        name: '医疗救助',
        description: '帮助困难家庭解决医疗问题',
        icon: '🏥'
      }
    })
  ])

  // 创建示例用户
  const users = await Promise.all([
    db.user.upsert({
      where: { email: 'zhangsan@example.com' },
      update: {},
      create: {
        email: 'zhangsan@example.com',
        name: '张三',
        phone: '13800138001'
      }
    }),
    db.user.upsert({
      where: { email: 'lisi@example.com' },
      update: {},
      create: {
        email: 'lisi@example.com',
        name: '李四',
        phone: '13800138002'
      }
    })
  ])

  // 创建示例项目
  const projects = await Promise.all([
    db.project.create({
      data: {
        title: '为山区小学修建图书馆',
        description: '帮助贫困山区小学修建一座图书馆，让孩子们能够接触到更多的书籍和知识。',
        content: '这个项目旨在为贵州省某贫困山区的小学修建一座图书馆。该小学目前有200多名学生，但学校条件简陋，没有专门的图书馆和阅读空间。我们计划修建一座200平方米的图书馆，包括阅读区、藏书区和多媒体学习区。项目完成后，将为孩子们提供一个良好的阅读环境，帮助他们开阔视野，增长知识。',
        targetAmount: 50000,
        currentAmount: 32000,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'active',
        location: '贵州省黔东南苗族侗族自治州',
        organizer: '希望工程基金会',
        contact: 'contact@hope.org',
        creatorId: users[0].id,
        categoryId: categories[2].id, // 教育助学
        donorCount: 156
      }
    }),
    db.project.create({
      data: {
        title: '残障人士手工艺品创业项目',
        description: '支持残障人士通过制作手工艺品实现自主创业，改善生活质量。',
        content: '本项目旨在帮助10名残障人士通过制作传统手工艺品实现自主创业。我们将提供技能培训、原材料采购、产品销售渠道等全方位支持。项目包括：1. 手工艺技能培训；2. 原材料采购补贴；3. 产品包装设计；4. 线上销售平台搭建；5. 市场推广支持。通过这个项目，我们希望帮助残障人士实现经济独立，提升自信心和生活质量。',
        targetAmount: 30000,
        currentAmount: 18500,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-11-30'),
        status: 'active',
        location: '浙江省杭州市',
        organizer: '残疾人联合会',
        contact: 'info@disable.org',
        creatorId: users[1].id,
        categoryId: categories[1].id, // 残障创业
        donorCount: 89
      }
    }),
    db.project.create({
      data: {
        title: '乡村道路硬化工程',
        description: '为偏远村庄修建硬化道路，改善村民出行条件。',
        content: '该项目旨在为云南省某偏远村庄修建2公里的硬化道路。目前该村只有土路，雨季泥泞难行，严重影响村民出行和农产品运输。项目包括：1. 道路路基整理；2. 混凝土铺设；3. 排水设施建设；4. 道路护栏安装。道路建成后，将极大改善村民的出行条件，促进当地经济发展。',
        targetAmount: 80000,
        currentAmount: 45000,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-15'),
        status: 'active',
        location: '云南省大理白族自治州',
        organizer: '乡村发展基金会',
        contact: 'road@rural.org',
        creatorId: users[0].id,
        categoryId: categories[0].id, // 乡村基建
        donorCount: 234
      }
    })
  ])

  // 创建示例捐款记录
  await Promise.all([
    db.donation.createMany({
      data: [
        {
          amount: 100,
          message: '希望孩子们能够有更好的学习环境！',
          anonymous: false,
          projectId: projects[0].id,
          donorId: users[1].id
        },
        {
          amount: 500,
          message: '支持残障人士创业，加油！',
          anonymous: true,
          projectId: projects[1].id,
          donorId: users[0].id
        },
        {
          amount: 200,
          message: '修路是好事，支持！',
          anonymous: false,
          projectId: projects[2].id,
          donorId: users[1].id
        }
      ]
    })
  ])

  console.log('数据库种子数据创建成功！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })