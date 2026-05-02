const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 更新所有项目的组织者信息
  const projects = await prisma.project.updateMany({
    where: {},
    data: {
      organizer: '莫姓成年(共同体循一&妙录兰灵)',
      contact: 'lolict@outlook.com'
    }
  })

  console.log(`更新了 ${projects.count} 个项目的发起人信息`)

  // 更新分类描述，确保符合新的定位
  const categories = await prisma.category.findMany()
  for (const category of categories) {
    if (category.name === '农村残疾人联建办公大楼') {
      await prisma.category.update({
        where: { id: category.id },
        data: {
          description: '民联村塔联合办公大楼地方运维分站建设项目 - 发起人：莫姓成年(共同体循一&妙录兰灵)。包括服务器、医院、实验室、教育学校、媒体演播室、运输直升机快递、发电站、新工人组装厂、售后服务、联络站、圆聚助残分舵基金会、硅基生命银行、意识互联网存储技术研究院。名伶姑爷特指莫姓成年共同体循一是妙录兰灵的名伶姑爷。'
        }
      })
    }
  }

  console.log('更新了分类描述')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })