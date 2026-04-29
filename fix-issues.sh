#!/bin/bash

echo "🔧 开始修复项目问题..."

# 1. 清理所有缓存
echo "📁 清理缓存..."
rm -rf .next
rm -rf node_modules/.cache
find . -name "*.log" -exec truncate -s 0 {} \;

# 2. 重新安装依赖（如果需要）
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# 3. 检查数据库
echo "🗄️ 检查数据库连接..."
node check-projects.js

# 4. 验证关键文件
echo "📋 验证关键文件..."
files_to_check=(
    "src/app/page.tsx"
    "src/app/not-found.tsx"
    "src/app/layout.tsx"
    "src/components/layout/index.ts"
    "src/components/layout/HeroSection.tsx"
    "src/app/api/projects/route.ts"
    "src/app/api/projects/[id]/donate/route.ts"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 缺失"
    fi
done

# 5. 运行代码检查
echo "🔍 运行代码检查..."
npm run lint

echo "✨ 修复完成！"
echo "🚀 请重新启动开发服务器：npm run dev"