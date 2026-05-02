const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 清除现有分类
  await prisma.category.deleteMany()

  // 创建新的分类体系
  const categories = [
    // 供残捐项目类型 (donation)
    {
      name: '农村残疾人联建办公大楼',
      description: '民联村塔联合办公大楼地方运维分站建设项目，包括服务器、医院、实验室、教育学校、媒体演播室、运输直升机快递、发电站、新工人组装厂、售后服务、联络站、圆聚助残分舵基金会、硅基生命银行、意识互联网存储技术研究院',
      icon: 'Building',
      priority: 10,
      projectType: 'donation'
    },
    {
      name: '残健共同体账户系统',
      description: '残健庇护信托智能合约区块链账户贡献系统，为农村残疾人提供未来人生保障和多元天枰倾斜庇佑',
      icon: 'Users',
      priority: 9,
      projectType: 'donation'
    },
    {
      name: '农村残疾人基础设施',
      description: '农村残疾人基础设施建设，包括无障碍设施、康复中心、技能培训场所等',
      icon: 'Home',
      priority: 8,
      projectType: 'donation'
    },
    {
      name: '残疾人创业扶持',
      description: '支持农村残疾人创业项目，提供启动资金、技术培训、市场对接等全方位支持',
      icon: 'Briefcase',
      priority: 7,
      projectType: 'donation'
    },
    {
      name: '未婚青年帮扶计划',
      description: '农村未婚青年婚恋帮扶项目，建设相亲平台、举办联谊活动、提供婚恋咨询服务',
      icon: 'Heart',
      priority: 6,
      projectType: 'donation'
    },
    {
      name: '无业人员技能培训',
      description: '为农村无业人员提供职业技能培训，包括现代农业、手工艺、电商运营等实用技能',
      icon: 'GraduationCap',
      priority: 6,
      projectType: 'donation'
    },
    {
      name: '辍学儿童教育救助',
      description: '帮助农村辍学儿童重返校园，提供学费资助、学习用品、心理辅导等支持',
      icon: 'BookOpen',
      priority: 9,
      projectType: 'donation'
    },
    {
      name: '医疗救助基金',
      description: '为农村贫困残疾人提供医疗救助，包括手术费用、康复治疗、药品资助等',
      icon: 'HeartPulse',
      priority: 9,
      projectType: 'donation'
    },
    
    // 益企捐项目类型 (enterprise)
    {
      name: '企业社会责任合作',
      description: '企业与农村残疾人合作社合作项目，提供技术支持、市场渠道、管理经验等资源',
      icon: 'Handshake',
      priority: 8,
      projectType: 'enterprise'
    },
    {
      name: '企业家赎罪基金',
      description: '为企业家提供赎罪机会，通过捐赠支持农村残疾人发展，同时获得企业税务减免和名誉权提升',
      icon: 'TrendingUp',
      priority: 7,
      projectType: 'enterprise'
    },
    {
      name: '产业扶贫投资',
      description: '企业投资农村残疾人产业发展项目，实现经济效益和社会效益双赢',
      icon: 'Investment',
      priority: 8,
      projectType: 'enterprise'
    },
    {
      name: '技术转移项目',
      description: '企业向农村残疾人转移先进技术，提升生产效率和产品质量',
      icon: 'Cpu',
      priority: 6,
      projectType: 'enterprise'
    }
  ]

  // 创建分类
  for (const category of categories) {
    await prisma.category.create({
      data: category
    })
  }

  console.log('分类创建完成！')
  console.log(`创建了 ${categories.length} 个分类`)
  console.log('供残捐项目类型:', categories.filter(c => c.projectType === 'donation').length, '个')
  console.log('益企捐项目类型:', categories.filter(c => c.projectType === 'enterprise').length, '个')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })