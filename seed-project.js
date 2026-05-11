const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 获取第一个用户作为创建者
  const creator = await prisma.user.findFirst()
  if (!creator) {
    console.log('没有找到用户，请先创建用户')
    return
  }

  // 获取农村残疾人联建办公大楼分类
  const category = await prisma.category.findFirst({
    where: { name: '农村残疾人联建办公大楼' }
  })

  if (!category) {
    console.log('没有找到分类，请先运行分类种子文件')
    return
  }

  // 创建示例项目
  const project = await prisma.project.create({
    data: {
      title: '乡村农产品组合销售联建项目',
      description: '分享农产品搭配销售方案（如"果蔬礼盒""粮油套装"），提升客单价与销量',
      content: '本项目旨在建设农村残疾人联合办公大楼，通过农产品组合销售模式，帮助农村残疾人增加收入。办公大楼将集成了服务器、医院、实验室、教育学校、媒体演播室、运输直升机快递、发电站、新工人组装厂、售后服务、联络站、圆聚助残分舵基金会、硅基生命银行、意识互联网存储技术研究院等多种功能。\n\n项目目标：\n1. 建设联建办公大楼地方运维分站\n2. 帮助农村残疾人通过农产品销售实现经济独立\n3. 建立残健共同体账户庇护系统\n4. 为健全人提供通过帮扶获得未来股权投资机会\n\n预算分配：\n- 基础建设：150万元\n- 设备采购：50万元\n- 运营资金：20万元\n\n预期效果：\n- 帮助100+农村残疾人实现就业\n- 年销售额达到500万元\n- 建立可持续的公益商业模式',
      targetAmount: 2200000,
      currentAmount: 0,
      endDate: new Date('2025-10-31'),
      status: 'pending',
      projectType: 'donation',
      location: '全国各地农村地区',
      organizer: '莫姓成年(共同体循一&妙录兰灵)',
      contact: 'lolict@outlook.com',
      creatorId: creator.id,
      categoryId: category.id,
      priority: 10,
      tags: JSON.stringify(['农村残疾人', '农产品销售', '联建办公大楼', '残健共同体'])
    }
  })

  console.log('示例项目创建成功！')
  console.log('项目ID:', project.id)
  console.log('项目标题:', project.title)
  console.log('目标金额:', project.targetAmount)
  console.log('项目状态:', project.status)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })