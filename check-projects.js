const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function checkProjects() {
  try {
    const projects = await db.project.findMany({
      include: {
        creator: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } }
      }
    });
    console.log('项目列表:');
    projects.forEach(p => {
      console.log(`ID: ${p.id}, 标题: ${p.title}, 状态: ${p.status}, 当前金额: ${p.currentAmount}, 目标: ${p.targetAmount}`);
    });
    await db.$disconnect();
  } catch (error) {
    console.error('错误:', error);
  }
}

checkProjects();