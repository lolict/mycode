const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // 检查User表的列
    const user = await prisma.user.findFirst()
    console.log('User structure:', Object.keys(user))
    
    // 尝试更新第一个用户
    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          userType: 'disabled',
          communityBalance: 5000,
          investmentPoints: 100,
          shelterLevel: 8
        }
      })
      console.log('Updated user:', updated)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })