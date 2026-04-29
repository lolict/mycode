const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 获取第一个用户
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log('没有找到用户')
    return
  }

  // 创建示例记名账本记录
  const sampleLedgers = [
    {
      ledgerType: 'technology',
      content: '开发了农村残疾人就业匹配系统的核心算法，提高了匹配效率30%，帮助50+残疾人找到合适工作',
      value: 1000,
      status: 'verified'
    },
    {
      ledgerType: 'technique',
      content: '为农村残疾人提供了编程技能培训，教授Web开发技术，帮助10名残疾人获得技术能力',
      value: 800,
      status: 'verified'
    },
    {
      ledgerType: 'volunteer',
      content: '志愿服务农村残疾人康复中心，累计服务时长200小时，帮助残疾人进行康复训练',
      value: 600,
      status: 'applied'
    },
    {
      ledgerType: 'intelligence',
      content: '撰写了《农村残疾人互联网创业指南》文章，提供了详细的创业思路和实施方法',
      value: 500,
      status: 'pending'
    },
    {
      ledgerType: 'cooperation',
      content: '与当地企业合作，建立了农村残疾人产品销售渠道，帮助销售农产品获得收入',
      value: 1200,
      status: 'verified'
    },
    {
      ledgerType: 'charity',
      content: '组织了农村残疾人关爱活动，为30户残疾人家庭送去生活必需品和关怀',
      value: 400,
      status: 'applied'
    },
    {
      ledgerType: 'time',
      content: '投入时间维护农村残疾人互助平台，确保平台正常运行，及时处理用户反馈',
      value: 300,
      status: 'verified'
    },
    {
      ledgerType: 'public_tool',
      content: '开发了残疾人无障碍工具，帮助视力障碍人士更好地使用互联网服务',
      value: 900,
      status: 'pending'
    }
  ]

  for (const ledger of sampleLedgers) {
    await prisma.namedLedger.create({
      data: {
        userId: user.id,
        ...ledger
      }
    })
  }

  console.log(`创建了 ${sampleLedgers.length} 条示例记名账本记录`)
  
  // 显示创建的记录
  const createdLedgers = await prisma.namedLedger.findMany({
    where: { userId: user.id },
    select: {
      ledgerType: true,
      content: true,
      value: true,
      status: true
    }
  })

  console.log('\n创建的记名账本记录：')
  createdLedgers.forEach((ledger, index) => {
    console.log(`${index + 1}. ${ledger.ledgerType} - ${ledger.value} - ${ledger.status}`)
    console.log(`   ${ledger.content.substring(0, 50)}...`)
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