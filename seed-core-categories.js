const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 清除现有分类
  await prisma.category.deleteMany()

  // 创建聚焦农村和残疾人的核心分类
  const categories = [
    {
      name: '农村残疾人就业帮扶',
      description: '为农村残疾人提供就业机会、技能培训、创业支持，实现经济独立和自我价值',
      icon: 'Wheelchair',
      priority: 10
    },
    {
      name: '农村残疾人基础设施建设',
      description: '建设无障碍设施、康复中心、残疾人就业场所等基础设施，改善农村残疾人生活环境',
      icon: 'Construction',
      priority: 9
    },
    {
      name: '残疾人医疗救助',
      description: '为农村贫困残疾人提供医疗费用救助、康复治疗、辅助器具等医疗支持',
      icon: 'Medical',
      priority: 9
    },
    {
      name: '农村残疾人教育支持',
      description: '帮助农村残疾儿童和成人获得教育机会，包括特殊教育、技能培训、学历提升等',
      icon: 'Education',
      priority: 8
    },
    {
      name: '农村基层组织建设',
      description: '建立农村残疾人互助组织、合作社、联合办公大楼等基层组织形式',
      icon: 'Organization',
      priority: 7
    },
    {
      name: '农村互联网建设',
      description: '为农村地区提供互联网接入、数字设备、技术培训，缩小数字鸿沟',
      icon: 'Internet',
      priority: 6
    },
    {
      name: '农村残疾人创业扶持',
      description: '支持农村残疾人创业项目，提供启动资金、技术指导、市场对接等全方位支持',
      icon: 'Business',
      priority: 7
    },
    {
      name: '农村社会保障体系',
      description: '建立完善农村残疾人社会保障网络，提供基本生活保障和风险防范',
      icon: 'Shield',
      priority: 8
    }
  ]

  // 创建分类
  for (const category of categories) {
    await prisma.category.create({
      data: category
    })
  }

  console.log('核心分类创建完成！')
  console.log(`创建了 ${categories.length} 个聚焦农村和残疾人的分类`)
  
  console.log('\n分类列表：')
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.name} (优先级: ${cat.priority})`)
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })