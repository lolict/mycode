const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function fixProjects() {
  try {
    console.log('检查所有项目状态...');
    
    // 查看所有项目
    const projects = await db.project.findMany();
    console.log('项目列表:');
    projects.forEach(p => {
      console.log(`- ID: ${p.id}, 标题: ${p.title}, 状态: ${p.status}, 创建时间: ${p.createdAt}`);
    });
    
    // 检查是否有pending状态的项目
    const pendingProjects = projects.filter(p => p.status === 'pending');
    console.log(`\nPending项目数量: ${pendingProjects.length}`);
    
    // 将所有pending项目改为active
    if (pendingProjects.length > 0) {
      console.log('正在激活pending项目...');
      for (const project of pendingProjects) {
        await db.project.update({
          where: { id: project.id },
          data: { status: 'active' }
        });
        console.log(`已激活项目: ${project.title}`);
      }
    }
    
    // 检查用户
    const users = await db.user.findMany();
    console.log(`\n用户数量: ${users.length}`);
    users.forEach(u => {
      console.log(`- ID: ${u.id}, 姓名: ${u.name}, 类型: ${u.userType || '未设置'}`);
    });
    
    console.log('\n修复完成!');
    
  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await db.$disconnect();
  }
}

fixProjects();