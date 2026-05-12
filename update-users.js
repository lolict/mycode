const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 更新现有用户的用户类型
  const users = await prisma.user.findMany()
  
  if (users.length >= 3) {
    // 设置第一个用户为健全人
    await prisma.user.update({
      where: { id: users[0].id },
      data: {
        userType: 'able-bodied',
        communityBalance: 1000,
        investmentPoints: 50,
        shelterLevel: 3
      }
    })

    // 设置第二个用户为残疾人
    if (users[1]) {
      await prisma.user.update({
        where: { id: users[1].id },
        data: {
          userType: 'disabled',
          communityBalance: 5000,
          investmentPoints: 20,
          shelterLevel: 8
        }
      })
    }

    // 设置第三个用户为企业
    if (users[2]) {
      await prisma.user.update({
        where: { id: users[2].id },
        data: {
          userType: 'enterprise',
          communityBalance: 10000,
          investmentPoints: 100,
          shelterLevel: 5
        }
      })
    }
  }

  console.log('用户类型更新完成！')
  
  // 显示更新后的用户信息
  const updatedUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      userType: true,
      communityBalance: true,
      investmentPoints: true,
      shelterLevel: true
    }
  })

  console.log('更新后的用户：')
  updatedUsers.forEach(user => {
    console.log(`- ${user.name} (${user.email}): ${user.userType}, 余额: ${user.communityBalance}, 投资点数: ${user.investmentPoints}, 等级: ${user.shelterLevel}`)
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